// Command cheatsheet, grouped. { group, items:[{cmd, desc}] }.
window.COMMANDS = [
  { group: "Navigation & files", items: [
    { cmd: "pwd", desc: "Print working directory" },
    { cmd: "cd -", desc: "Go to previous directory" },
    { cmd: "ls -lah", desc: "Long list, all files, human sizes" },
    { cmd: "mkdir -p a/b/c", desc: "Create nested directories" },
    { cmd: "cp -r src dst", desc: "Copy recursively" },
    { cmd: "mv old new", desc: "Move / rename" },
    { cmd: "rm -r dir", desc: "Remove recursively" },
    { cmd: "ln -s tgt link", desc: "Create symbolic link" },
    { cmd: "tree", desc: "Show directory tree" }
  ]},
  { group: "Search & text", items: [
    { cmd: "grep -rin 'x' .", desc: "Recursive, case-insensitive, numbered" },
    { cmd: "grep -E 'a|b'", desc: "Extended regex (alternation)" },
    { cmd: "grep -v 'x'", desc: "Invert match" },
    { cmd: "find . -name '*.log'", desc: "Find by name" },
    { cmd: "find . -mtime -7", desc: "Modified in last 7 days" },
    { cmd: "sed -i 's/a/b/g' f", desc: "In-place replace all" },
    { cmd: "awk '{print $1}'", desc: "Print first field" },
    { cmd: "cut -d: -f1 /etc/passwd", desc: "First colon-field" },
    { cmd: "sort | uniq -c", desc: "Count unique lines" },
    { cmd: "wc -l", desc: "Count lines" },
    { cmd: "diff -u a b", desc: "Unified diff" }
  ]},
  { group: "Pipes & redirection", items: [
    { cmd: "cmd > file", desc: "stdout to file (overwrite)" },
    { cmd: "cmd >> file", desc: "stdout to file (append)" },
    { cmd: "cmd 2> err", desc: "stderr to file" },
    { cmd: "cmd > f 2>&1", desc: "stdout + stderr to file" },
    { cmd: "cmd 2>/dev/null", desc: "Discard errors" },
    { cmd: "a | b", desc: "Pipe a's output into b" },
    { cmd: "cmd | tee f", desc: "Show and save output" }
  ]},
  { group: "Logs & monitoring", items: [
    { cmd: "journalctl -u svc", desc: "Logs for a unit" },
    { cmd: "journalctl -b -p err", desc: "This boot, errors+" },
    { cmd: "journalctl -f", desc: "Follow live" },
    { cmd: "tail -f /var/log/syslog", desc: "Follow a log file" },
    { cmd: "dmesg | tail", desc: "Kernel messages" },
    { cmd: "systemctl status svc", desc: "Service state + logs" },
    { cmd: "systemctl --failed", desc: "Failed units" }
  ]},
  { group: "Disks & filesystems", items: [
    { cmd: "lsblk -f", desc: "Devices + filesystems" },
    { cmd: "df -h", desc: "Filesystem usage" },
    { cmd: "du -sh *", desc: "Directory sizes" },
    { cmd: "sudo fdisk -l", desc: "List disks/partitions" },
    { cmd: "sudo parted /dev/sdX", desc: "Partition (GPT)" },
    { cmd: "sudo mkfs.ext4 /dev/sdX1", desc: "Make ext4 fs" },
    { cmd: "sudo fsck -y /dev/sdX1", desc: "Check/repair (unmounted)" },
    { cmd: "sudo mount /dev/sdX1 /mnt", desc: "Mount" }
  ]},
  { group: "Cron", items: [
    { cmd: "crontab -e", desc: "Edit your crontab" },
    { cmd: "crontab -l", desc: "List your crontab" },
    { cmd: "0 2 * * *", desc: "Daily 02:00" },
    { cmd: "*/15 * * * *", desc: "Every 15 min" },
    { cmd: "0 9 * * 1", desc: "Mondays 09:00" },
    { cmd: "@reboot", desc: "Once at boot" }
  ]},
  { group: "Users & permissions", items: [
    { cmd: "sudo adduser bob", desc: "Create user" },
    { cmd: "sudo usermod -aG sudo bob", desc: "Add to group" },
    { cmd: "id bob", desc: "UID/GID/groups" },
    { cmd: "chmod 644 file", desc: "Set octal mode" },
    { cmd: "chmod u+x file", desc: "Add owner execute" },
    { cmd: "chown u:g file", desc: "Set owner:group" },
    { cmd: "chmod +t dir", desc: "Sticky bit" }
  ]},
  { group: "Passwords, sudo & SSH", items: [
    { cmd: "chage -l bob", desc: "Show aging info" },
    { cmd: "sudo chage -M 90 bob", desc: "Max age 90 days" },
    { cmd: "sudo visudo", desc: "Edit sudoers safely" },
    { cmd: "sudo -l", desc: "List sudo rights" },
    { cmd: "ssh-keygen -t ed25519", desc: "Generate key" },
    { cmd: "ssh-copy-id user@host", desc: "Install public key" },
    { cmd: "chmod 600 ~/.ssh/authorized_keys", desc: "Fix key perms" }
  ]}
];
