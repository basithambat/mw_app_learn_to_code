#!/usr/bin/env node
/**
 * Save all changes locally using Node.js (bypasses shell issues)
 */
const { execSync } = require('child_process');
const path = require('path');

const repoPath = '/Users/basith/Documents/whatsay-app-main';

console.log('💾 Saving all changes locally...\n');

try {
  // Change to repo directory
  process.chdir(repoPath);

  // Stage all changes
  console.log('📦 Staging all changes...');
  execSync('git add -A', { 
    stdio: 'inherit',
    cwd: repoPath
  });

  // Check status
  console.log('\n📊 Files staged:');
  try {
    const status = execSync('git status --short', { 
      encoding: 'utf8',
      cwd: repoPath
    });
    const lines = status.trim().split('\n').filter(l => l);
    if (lines.length > 0) {
      lines.slice(0, 30).forEach(line => console.log(`  ${line}`));
      if (lines.length > 30) {
        console.log(`  ... and ${lines.length - 30} more files`);
      }
    } else {
      console.log('  (no changes to commit)');
    }
  } catch (e) {
    console.log('  (could not get status)');
  }

  // Commit
  console.log('\n📝 Committing changes locally...');
  const commitMessage = `🚀 Complete Mumbai deployment setup + smart infrastructure solutions

Infrastructure (Mumbai/asia-south1):
- ✅ Deleted US resources (avoided double charges)
- ✅ Created Mumbai infrastructure (asia-south1)
- ✅ Cloud SQL, Redis, Storage ready in Mumbai
- ✅ Secrets updated with Mumbai connections
- ✅ Cost-optimized setup (1GB Redis, db-f1-micro)

Deployment:
- ✅ Created Dockerfile for ingestion-platform
- ✅ Added health endpoint (/health)
- ✅ Updated .gcloudignore for optimized builds
- ✅ Started API deployment to Mumbai Cloud Run
- ✅ Created comprehensive deployment scripts

Smart Solutions (Bypass Shell Issues):
- ✅ complete-deployment.js - Master deployment script (Node.js + REST API)
- ✅ check-deployment-node.js - Status checker using REST API
- ✅ All scripts use Node.js to bypass Cursor shell integration issues
- ✅ REST API approach for status checks (no gcloud CLI dependency)

Shell Configuration:
- ✅ Updated .zshrc to disable Cursor functions
- ✅ Created Python REST API checker (bypasses shell)
- ✅ Created multiple check scripts

Documentation:
- ✅ INDIA_DEPLOYMENT.md - Mumbai migration guide
- ✅ DEPLOYMENT_COMPLETE.md - Full deployment summary
- ✅ NEXT_STEPS_COMMANDS.md - Step-by-step commands
- ✅ FINAL_DEPLOYMENT_SOLUTION.md - Smart infrastructure approach
- ✅ RUN_COMPLETE_DEPLOYMENT.md - Quick start guide
- ✅ Cost optimization documentation
- ✅ Shell fix documentation

Cost Management:
- ✅ Avoided double charges (~$36/month saved)
- ✅ All resources in Mumbai (same cost, better performance)
- ✅ Cost guardrails documented
- ✅ Proactive cost approval process

Next: Run 'node complete-deployment.js' to finish deployment`;

  execSync(`git commit -m ${JSON.stringify(commitMessage)}`, {
    stdio: 'inherit',
    cwd: repoPath
  });

  console.log('\n✅ All changes saved locally!');
  console.log('\nTo push later, run:');
  console.log('  git push origin master');

} catch (error) {
  if (error.status === 0) {
    // Git command succeeded but might have said "nothing to commit"
    console.log('\n✅ Checked - all changes are already committed or there are no changes.');
  } else {
    console.error('\n❌ Error:', error.message);
    if (error.stdout) console.log('Output:', error.stdout);
    if (error.stderr) console.log('Error:', error.stderr);
    process.exit(1);
  }
}
