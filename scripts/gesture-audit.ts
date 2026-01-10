#!/usr/bin/env ts-node

/**
 * Gesture Architecture Audit Script
 * 
 * This script scans the codebase for common gesture anti-patterns that lead to bugs.
 * It fails CI if any violations are detected.
 * 
 * Usage: ts-node scripts/gesture-audit.ts
 * 
 * Run in CI with: npm run audit:gestures
 */

import * as fs from 'fs';
import * as path from 'path';

interface Violation {
    file: string;
    line: number;
    rule: string;
    message: string;
    code: string;
}

const violations: Violation[] = [];

// Directories to scan
const SCAN_DIRS = ['components', 'hooks', 'app'];
const FILE_EXTENSIONS = ['.tsx', '.ts'];

// Rules to check
const RULES = {
    HOOK_IN_RENDER: {
        name: 'no-hook-in-render-callback',
        pattern: /renderItem.*useAnimatedStyle|renderScreen.*useAnimatedStyle|renderItem.*useDerivedValue|renderScreen.*useDerivedValue/s,
        message: 'Hook called inside render callback. Extract to component.',
    },
    REF_IN_WORKLET: {
        name: 'no-ref-in-worklet',
        pattern: /('worklet'|"worklet")[\s\S]*?\.current\s*=/,
        message: 'JS ref mutated inside worklet. Use useSharedValue instead.',
    },
    DEPRECATED_PAN_HANDLER: {
        name: 'no-pan-gesture-handler',
        pattern: /<PanGestureHandler/,
        message: 'Deprecated PanGestureHandler found. Use Gesture.Pan() instead.',
    },
    SHAREDVALUE_IN_DEPS: {
        name: 'no-sharedvalue-in-deps',
        pattern: /useMemo\(\(\)[\s\S]*?\],\s*\[[\s\S]*?\.value[\s\S]*?\]\)/,
        message: 'SharedValue .value in dependency array. Remove .value.',
    },
};

/**
 * Recursively find all files with given extensions
 */
function findFiles(dir: string, extensions: string[]): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
        return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // Skip node_modules, .git, etc
            if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                files.push(...findFiles(fullPath, extensions));
            }
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (extensions.includes(ext)) {
                files.push(fullPath);
            }
        }
    }

    return files;
}

/**
 * Check file for violations
 */
function checkFile(filePath: string): void {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Check each rule
    for (const [key, rule] of Object.entries(RULES)) {
        const matches = content.match(rule.pattern);

        if (matches) {
            // Find line number
            let lineNum = 1;
            let charCount = 0;
            const matchIndex = content.indexOf(matches[0]);

            for (let i = 0; i < lines.length; i++) {
                charCount += lines[i].length + 1; // +1 for newline
                if (charCount > matchIndex) {
                    lineNum = i + 1;
                    break;
                }
            }

            violations.push({
                file: filePath,
                line: lineNum,
                rule: rule.name,
                message: rule.message,
                code: lines[lineNum - 1]?.trim() || '',
            });
        }
    }
}

/**
 * Main audit function
 */
function audit(): void {
    console.log('🔍 Gesture Architecture Audit\n');

    // Find all files to scan
    const allFiles: string[] = [];
    for (const dir of SCAN_DIRS) {
        const dirPath = path.join(process.cwd(), dir);
        allFiles.push(...findFiles(dirPath, FILE_EXTENSIONS));
    }

    console.log(`Scanning ${allFiles.length} files...\n`);

    // Check each file
    for (const file of allFiles) {
        checkFile(file);
    }

    // Report results
    if (violations.length === 0) {
        console.log('✅ No gesture anti-patterns detected!\n');
        process.exit(0);
    } else {
        console.error(`❌ Found ${violations.length} violation(s):\n`);

        for (const violation of violations) {
            console.error(`\x1b[31m${violation.file}:${violation.line}\x1b[0m`);
            console.error(`  Rule: ${violation.rule}`);
            console.error(`  ${violation.message}`);
            console.error(`  Code: ${violation.code}`);
            console.error('');
        }

        console.error('See docs/gesture-guidelines.md for details.\n');
        process.exit(1);
    }
}

// Run audit
audit();
