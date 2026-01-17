#!/usr/bin/env python3
"""
Validates git commit messages before execution.
Blocks commits with Claude signatures or bad format.
"""
import json
import re
import sys

# Conventional commit types
VALID_TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'build', 'ci']

# Patterns to block
BLOCKED_PATTERNS = [
    r'Generated with \[?Claude',
    r'Co-Authored-By:.*Claude',
    r'Co-Authored-By:.*Anthropic',
    r'🤖.*Claude',
]

def validate_commit_message(command: str) -> str | None:
    """Returns error message if invalid, None if valid."""

    # Extract commit message from: git commit -m "message" or git commit -m 'message'
    match = re.search(r'git\s+commit.*?(?:-m|--message)[=\s]+["\'](.+?)["\']', command, re.DOTALL)

    if not match:
        # Check for HEREDOC style: git commit -m "$(cat <<'EOF'
        heredoc_match = re.search(r'git\s+commit.*?-m.*?<<.*?EOF(.*?)EOF', command, re.DOTALL)
        if heredoc_match:
            message = heredoc_match.group(1).strip()
        else:
            return None  # Not a commit command we can parse
    else:
        message = match.group(1)

    # Check for blocked patterns (Claude signatures)
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, message, re.IGNORECASE):
            return f"Blocked: Remove Claude/AI signature from commit message"

    # Get first line (subject)
    subject = message.split('\n')[0].strip()

    # Check subject length (max 72, ideal <= 50)
    if len(subject) > 72:
        return f"Subject too long ({len(subject)} chars). Keep under 72 characters."

    # Check for conventional commit format: type(scope): description or type: description
    conv_pattern = r'^(' + '|'.join(VALID_TYPES) + r')(\(.+?\))?!?: .+'
    if not re.match(conv_pattern, subject):
        return (
            f"Use Conventional Commits format: type(scope): description\n"
            f"Valid types: {', '.join(VALID_TYPES)}\n"
            f"Example: feat(auth): add Google OAuth login"
        )

    # Check imperative mood (basic check - shouldn't end with 'ed' after the colon)
    desc_match = re.search(r': (.+)$', subject)
    if desc_match:
        desc = desc_match.group(1)
        if desc.split()[0].endswith('ed'):
            return f"Use imperative mood: '{desc.split()[0]}' -> remove '-ed' (e.g., 'add' not 'added')"

    return None  # Valid!


def main():
    try:
        input_data = json.load(sys.stdin)
        tool_name = input_data.get("tool_name", "")
        tool_input = input_data.get("tool_input", {})
        command = tool_input.get("command", "")

        # Only validate Bash commands that look like git commits
        if tool_name != "Bash" or "git commit" not in command:
            sys.exit(0)

        error = validate_commit_message(command)

        if error:
            print(f"COMMIT BLOCKED: {error}", file=sys.stderr)
            sys.exit(2)  # Exit code 2 blocks the tool

        sys.exit(0)  # Valid, allow

    except Exception as e:
        # Don't block on validation errors, just warn
        print(f"Commit validator warning: {e}", file=sys.stderr)
        sys.exit(0)


if __name__ == "__main__":
    main()
