# Records the README demo with VHS: one session, English -> Cantonese -> pirate.
# Setup: clone this repo to /tmp/lingo-demo/lingo-switch and create an empty
# /tmp/lingo-demo/project, then run `vhs assets/demo.tape`.
# The README GIF is this recording at 2x:
#   ffmpeg -i demo.mp4 -vf "setpts=0.5*PTS" demo-2x.mp4

Output demo.mp4
Output demo.gif

Set Shell zsh
Set FontFamily "JetBrains Mono"
Set FontSize 22
Set Width 1600
Set Height 900
Set Padding 28
Set LetterSpacing 0
Set LineHeight 1.2
Set Theme "Catppuccin Mocha"
Set TypingSpeed 40ms
Set WindowBar Colorful

Hide
Type "for v in ${(k)parameters[(I)CLAUDE*]}; do unset $v; done; cd /tmp/lingo-demo/project && clear && claude --model opus --plugin-dir /tmp/lingo-demo/lingo-switch --setting-sources project,local"
Enter
Sleep 10s
Type "/lang en"
Enter
Sleep 2s
Type "/clear"
Enter
Sleep 2s
Show

# --- open the bar ---
Sleep 1s
Type "/lang"
Sleep 400ms
Enter
Sleep 2s

# --- English ---
Type "How do I undo my last git commit but keep my changes? One sentence."
Sleep 500ms
Enter
Wait+Screen@120s /keep my changes\?[\s\S]*⏺/
Sleep 8s

# --- switch to Cantonese, same session ---
Type "2"
Sleep 1.5s
Type "What if I already pushed it? Two sentences."
Sleep 500ms
Enter
Wait+Screen@120s /already pushed it[\s\S]*⏺/
Sleep 10s

# --- switch to Pirate, same session ---
Type "7"
Sleep 1.5s
Type "How do I check what that commit changed first? Two sentences."
Sleep 500ms
Enter
# VHS cannot read the screen once it scrolls, so wait by time
Sleep 22s

# --- dismiss ---
Type "0"
Sleep 3s
