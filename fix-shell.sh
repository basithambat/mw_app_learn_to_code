#!/bin/bash
# Fix shell configuration to bypass Cursor IDE issues

# Create a clean .zshrc backup
if [ -f ~/.zshrc ]; then
  cp ~/.zshrc ~/.zshrc.backup.$(date +%Y%m%d_%H%M%S)
  echo "✅ Backed up .zshrc"
fi

# Create a minimal .zshrc that works
cat > ~/.zshrc << 'EOF'
# Minimal zshrc to avoid Cursor IDE integration issues

# Basic PATH setup
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# Langflow
if [ -f "$HOME/.langflow/uv/env" ]; then
  . "$HOME/.langflow/uv/env"
fi

# Antigravity
export PATH="/Users/basith/.antigravity/antigravity/bin:$PATH"

# Java
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"

# Disable problematic Cursor functions if they exist
unset -f cursor_snap_FUNCTION 2>/dev/null
unset -f dump_zsh_state 2>/dev/null

# Basic prompt
PS1='%n@%m %1~ %# '
EOF

echo "✅ Created minimal .zshrc"
echo ""
echo "To apply:"
echo "1. Close and reopen terminal, OR"
echo "2. Run: source ~/.zshrc"
echo ""
echo "Original .zshrc backed up to: ~/.zshrc.backup.*"
