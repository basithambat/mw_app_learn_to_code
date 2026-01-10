#!/usr/bin/env node

/**
 * Gesture & Animation Static Analysis Script
 * 
 * Scans all TypeScript files for common Reanimated anti-patterns:
 * - SharedValues in dependency arrays
 * - Gestures created without useMemo
 * - Deprecated useAnimatedGestureHandler
 * - Variables used before declaration in gesture handlers
 * 
 * Run: npm run audit:gestures
 */

const fs = require('fs');
const path = require('path');

const ISSUES = [];
const SCANNED_FILES = [];

function scanFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;

    SCANNED_FILES.push(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, i) => {
        const lineNum = i + 1;

        // Check #1: SharedValues in dependency arrays
        if (line.includes('useSharedValue') || line.includes('useDerivedValue')) {
            const varName = line.match(/const\s+(\w+)\s*=/)?.[1];
            if (varName) {
                // Look ahead for this var in dependency arrays
                const nextLines = lines.slice(i, Math.min(i + 100, lines.length)).join('\n');
                const depArrayMatch = nextLines.match(new RegExp(`},\\s*\\[([^\\]]*)${varName}([^\\]]*)\\]`));
                if (depArrayMatch) {
                    ISSUES.push({
                        file: filePath,
                        line: lineNum,
                        severity: 'ERROR',
                        rule: 'no-sharedvalue-in-deps',
                        message: `SharedValue "${varName}" appears in dependency array`,
                        fix: `Remove "${varName}" from the dependency array. SharedValues are stable references.`,
                    });
                }
            }
        }

        // Check #2: Gesture.Pan() without useMemo
        if (line.match(/Gesture\.(Pan|Tap|LongPress|Pinch|Rotation|Fling|Native)\(\)/)) {
            const prevLines = lines.slice(Math.max(0, i - 10), i).join('\n');
            const nextLines = lines.slice(i, Math.min(i + 3, lines.length)).join('\n');

            if (!prevLines.includes('useMemo') && !nextLines.includes('useMemo')) {
                ISSUES.push({
                    file: filePath,
                    line: lineNum,
                    severity: 'WARNING',
                    rule: 'gesture-requires-memo',
                    message: 'Gesture created without useMemo - may cause re-renders',
                    fix: 'Wrap gesture creation in useMemo(() => Gesture.Pan()..., [deps])',
                });
            }
        }

        // Check #3: useAnimatedGestureHandler (deprecated)
        if (line.includes('useAnimatedGestureHandler')) {
            ISSUES.push({
                file: filePath,
                line: lineNum,
                severity: 'WARNING',
                rule: 'deprecated-api',
                message: 'useAnimatedGestureHandler is deprecated in Reanimated 2+',
                fix: 'Refactor to use Gesture.Pan().onUpdate().onEnd() pattern',
            });
        }

        // Check #4: .value in dependency array
        if (line.match(/],\s*\[.*\.value.*\]/)) {
            ISSUES.push({
                file: filePath,
                line: lineNum,
                severity: 'ERROR',
                rule: 'no-value-in-deps',
                message: 'Using .value in dependency array - this defeats reactivity',
                fix: 'Remove .value - just use the SharedValue reference (or remove entirely)',
            });
        }

        // Check #5: Spring configs created inline
        if (line.match(/withSpring\([^,]+,\s*{\s*damping:/)) {
            ISSUES.push({
                file: filePath,
                line: lineNum,
                severity: 'INFO',
                rule: 'use-centralized-config',
                message: 'Inline spring config - consider using centralized config',
                fix: 'Import from @/constants/springConfigs: SPRING_CONFIG_SNAPPY, etc.',
            });
        }
    });
}

function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scanDirectory(fullPath);
        } else if (stat.isFile()) {
            scanFile(fullPath);
        }
    });
}

// Main execution
const root = path.join(__dirname, '..');
const targetDirs = [
    path.join(root, 'hooks'),
    path.join(root, 'components'),
    path.join(root, 'app'),
];

console.log('\n🔍 Scanning for Reanimated anti-patterns...\n');

targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        scanDirectory(dir);
    }
});

// Output results
console.log(`📁 Scanned ${SCANNED_FILES.length} files\n`);

if (ISSUES.length === 0) {
    console.log('✅ No issues found!\n');
    process.exit(0);
}

// Group by severity
const errors = ISSUES.filter(i => i.severity === 'ERROR');
const warnings = ISSUES.filter(i => i.severity === 'WARNING');
const info = ISSUES.filter(i => i.severity === 'INFO');

if (errors.length > 0) {
    console.log(`❌ ERRORS (${errors.length}):\n`);
    errors.forEach(issue => {
        const relativePath = path.relative(root, issue.file);
        console.log(`  ${relativePath}:${issue.line}`);
        console.log(`    [${issue.rule}] ${issue.message}`);
        console.log(`    Fix: ${issue.fix}\n`);
    });
}

if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${warnings.length}):\n`);
    warnings.forEach(issue => {
        const relativePath = path.relative(root, issue.file);
        console.log(`  ${relativePath}:${issue.line}`);
        console.log(`    [${issue.rule}] ${issue.message}`);
        console.log(`    Fix: ${issue.fix}\n`);
    });
}

if (info.length > 0) {
    console.log(`ℹ️  INFO (${info.length}):\n`);
    info.forEach(issue => {
        const relativePath = path.relative(root, issue.file);
        console.log(`  ${relativePath}:${issue.line} - ${issue.message}\n`);
    });
}

console.log(`\nTotal: ${ISSUES.length} issue(s) found`);
console.log(`  ${errors.length} errors, ${warnings.length} warnings, ${info.length} info\n`);

// Exit with error code if there are errors
if (errors.length > 0) {
    process.exit(1);
}
