// Study content for the Canonical "Using Linux Terminal" exam.
// Mapped 1:1 to the official exam-content outline (3 sections).
// Each topic: { id, title, blurb, body (HTML) }.

window.TOPICS = [
  {
    section: "1. Navigating Files & Filesystems",
    id: "nav-basics",
    title: "Navigating & manipulating directories and files",
    blurb: "Move around the filesystem and create, copy, move, and remove files.",
    body: `
<h4>The filesystem hierarchy</h4>
<p>Linux uses a single rooted tree starting at <code>/</code>. Key directories:</p>
<ul>
  <li><code>/etc</code> — system-wide configuration files</li>
  <li><code>/home</code> — user home directories</li>
  <li><code>/var</code> — variable data: logs (<code>/var/log</code>), spool, caches</li>
  <li><code>/usr</code> — user programs and libraries</li>
  <li><code>/bin</code>, <code>/sbin</code> — essential binaries</li>
  <li><code>/tmp</code> — temporary files (cleared on reboot)</li>
  <li><code>/dev</code>, <code>/proc</code>, <code>/sys</code> — device & kernel virtual filesystems</li>
</ul>

<h4>Moving around</h4>
<pre><code>pwd                 # print working directory
cd /var/log         # absolute path
cd ..               # up one level
cd ~                # your home directory
cd -                # previous directory
ls -lah             # long, all (incl. hidden), human sizes</code></pre>

<h4>Creating & removing</h4>
<pre><code>mkdir -p a/b/c      # create nested dirs
touch file.txt      # create empty file / update timestamp
cp -r src/ dst/     # copy recursively
mv old new          # move or rename
rm file             # remove file
rm -r dir/          # remove dir recursively
rmdir emptydir      # remove empty dir only
ln -s target link   # symbolic link</code></pre>

<h4>Paths & wildcards (globbing)</h4>
<ul>
  <li><code>*</code> — any characters &nbsp; <code>ls *.log</code></li>
  <li><code>?</code> — single character &nbsp; <code>ls file?.txt</code></li>
  <li><code>[a-c]</code> — character range &nbsp; <code>ls file[1-3]</code></li>
  <li><code>{a,b}</code> — brace expansion &nbsp; <code>cp file.{txt,bak}</code></li>
</ul>
<p class="tip"><b>Exam tip:</b> Globbing is expanded by the <em>shell</em> before the command runs — it is not the same as regex.</p>
`
  },
  {
    section: "1. Navigating Files & Filesystems",
    id: "regex",
    title: "Regular expressions",
    blurb: "Match text patterns with grep, sed, and friends.",
    body: `
<h4>grep — search text with patterns</h4>
<pre><code>grep 'error' file.log          # lines containing 'error'
grep -i 'error' file.log       # case-insensitive
grep -r 'TODO' src/            # recursive
grep -n 'main' file.c          # show line numbers
grep -v 'debug' file.log       # invert: lines NOT matching
grep -c 'error' file.log       # count matching lines
grep -E 'foo|bar' file         # extended regex (or egrep)
grep -o 'user=[a-z]*' file     # print only the match</code></pre>

<h4>Basic Regular Expressions (BRE)</h4>
<ul>
  <li><code>.</code> — any single character</li>
  <li><code>^</code> — start of line &nbsp; <code>$</code> — end of line</li>
  <li><code>*</code> — zero or more of the preceding</li>
  <li><code>[abc]</code> — any one of a, b, c &nbsp; <code>[^abc]</code> — none of them</li>
  <li><code>[0-9]</code> — a digit range</li>
  <li><code>\{2,4\}</code> — between 2 and 4 repeats (escaped in BRE)</li>
</ul>

<h4>Extended Regular Expressions (ERE, use <code>grep -E</code>)</h4>
<ul>
  <li><code>+</code> — one or more &nbsp; <code>?</code> — zero or one</li>
  <li><code>|</code> — alternation (or)</li>
  <li><code>( )</code> — grouping &nbsp; <code>{2,4}</code> — repeats (no escaping)</li>
</ul>

<h4>Anchoring examples</h4>
<pre><code>grep '^root' /etc/passwd       # lines starting with root
grep 'bash$' /etc/passwd       # lines ending in bash
grep -E '^[0-9]{3}-[0-9]{4}$'  # a 000-0000 pattern</code></pre>
<p class="tip"><b>Exam tip:</b> Know the difference between BRE and ERE — <code>+</code>, <code>?</code>, <code>|</code>, <code>{}</code>, <code>()</code> need escaping in BRE but not with <code>grep -E</code>.</p>
`
  },
  {
    section: "1. Navigating Files & Filesystems",
    id: "pipes-redirection",
    title: "Pipes & redirection",
    blurb: "Chain commands and control input/output streams.",
    body: `
<h4>The three standard streams</h4>
<ul>
  <li><b>stdin</b> — file descriptor <code>0</code></li>
  <li><b>stdout</b> — file descriptor <code>1</code></li>
  <li><b>stderr</b> — file descriptor <code>2</code></li>
</ul>

<h4>Redirection</h4>
<pre><code>cmd > file       # stdout to file (overwrite)
cmd >> file      # stdout to file (append)
cmd 2> err.log   # stderr to file
cmd > out 2>&1   # stdout AND stderr to same file
cmd &> all.log   # bash shorthand for the above
cmd < input.txt  # read stdin from file
cmd 2>/dev/null  # discard errors</code></pre>

<h4>Pipes</h4>
<p>A pipe <code>|</code> sends the stdout of one command to the stdin of the next.</p>
<pre><code>ps aux | grep nginx
cat access.log | grep 404 | wc -l
ls -l | sort -k5 -n           # sort by 5th column numerically
du -sh * | sort -h            # largest dirs</code></pre>

<h4>tee — write to file AND pass through</h4>
<pre><code>cmd | tee out.txt             # see output and save it
cmd | tee -a out.txt          # append
cmd | sudo tee /etc/file      # common way to write privileged files</code></pre>

<h4>Text-processing tools you'll pipe into</h4>
<pre><code>sort        # sort lines        (-n numeric, -r reverse, -u unique)
uniq        # collapse repeats  (-c count) — needs sorted input
wc          # word/line/char count (-l lines)
cut         # cut columns       (cut -d: -f1 /etc/passwd)
awk         # field processing  (awk '{print $1}')
sed         # stream edit       (sed 's/old/new/g')
head / tail # first / last N lines (tail -f follows)
tr          # translate chars   (tr 'a-z' 'A-Z')</code></pre>
<p class="tip"><b>Exam tip:</b> <code>uniq</code> only removes <em>adjacent</em> duplicates, so it's almost always used as <code>sort | uniq</code>.</p>
`
  },
  {
    section: "1. Navigating Files & Filesystems",
    id: "search-compare",
    title: "Searching, comparing & modifying files",
    blurb: "find, locate, diff, sed, and in-place editing.",
    body: `
<h4>Finding files</h4>
<pre><code>find /etc -name '*.conf'          # by name
find . -type f -mtime -7          # files modified in last 7 days
find . -type d -empty             # empty directories
find / -size +100M                # larger than 100 MB
find . -name '*.tmp' -delete      # find and delete
find . -type f -exec chmod 644 {} \\;  # run a command per match
locate nginx.conf                 # fast index-based (needs updatedb)
which python3                     # path of a command
type ll                           # is it an alias/builtin/binary?</code></pre>

<h4>Comparing files</h4>
<pre><code>diff a.txt b.txt        # line differences
diff -u a.txt b.txt     # unified format (patch style)
cmp a.bin b.bin         # byte-level compare
comm sorted1 sorted2    # common/unique lines (sorted input)
md5sum file             # checksum for integrity</code></pre>

<h4>Modifying with sed</h4>
<pre><code>sed 's/foo/bar/' file        # replace first foo per line
sed 's/foo/bar/g' file       # replace all
sed -i 's/foo/bar/g' file    # edit file in place
sed -n '5,10p' file          # print lines 5-10
sed '/^#/d' file             # delete comment lines
sed '2d' file                # delete line 2</code></pre>

<h4>Viewing files</h4>
<pre><code>cat / less / more            # view content
head -n 20 / tail -n 20      # first / last lines
tail -f /var/log/syslog      # live follow
nl file                      # number lines</code></pre>
<p class="tip"><b>Exam tip:</b> <code>sed -i</code> changes the file on disk with no undo — practice on a copy.</p>
`
  },

  {
    section: "2. Managing System Resources",
    id: "logs-rotation",
    title: "System logs & log rotation",
    blurb: "Where logs live, journald, and configuring logrotate.",
    body: `
<h4>Where logs live</h4>
<ul>
  <li><code>/var/log/syslog</code> — general system messages (Debian/Ubuntu)</li>
  <li><code>/var/log/auth.log</code> — authentication & sudo</li>
  <li><code>/var/log/kern.log</code> — kernel messages</li>
  <li><code>/var/log/dpkg.log</code> — package installs</li>
  <li><code>/var/log/apt/</code> — apt history</li>
</ul>

<h4>systemd journal (journalctl)</h4>
<pre><code>journalctl                    # all logs
journalctl -b                 # since last boot
journalctl -u ssh             # for a specific unit/service
journalctl -f                 # follow (live)
journalctl -p err             # priority err and worse
journalctl --since "1 hour ago"
journalctl --since today --until "10:00"
journalctl --disk-usage       # space used by the journal</code></pre>

<h4>logrotate</h4>
<p>Prevents logs from filling the disk by rotating, compressing, and deleting old logs.</p>
<ul>
  <li>Main config: <code>/etc/logrotate.conf</code></li>
  <li>Per-app configs: <code>/etc/logrotate.d/</code></li>
</ul>
<pre><code>/var/log/myapp/*.log {
    daily            # rotate every day (or weekly/monthly)
    rotate 7         # keep 7 old copies
    compress         # gzip rotated logs
    delaycompress    # compress on the NEXT rotation
    missingok        # don't error if log is missing
    notifempty       # skip if empty
    create 640 root adm   # recreate with these perms
    postrotate
        systemctl reload myapp
    endscript
}</code></pre>
<pre><code>logrotate -d /etc/logrotate.conf   # debug/dry-run
logrotate -f /etc/logrotate.conf   # force a rotation now</code></pre>
<p class="tip"><b>Exam tip:</b> logrotate is triggered by cron/systemd-timer; <code>-d</code> is a dry run (debug), <code>-f</code> forces rotation.</p>
`
  },
  {
    section: "2. Managing System Resources",
    id: "disks-partitions",
    title: "Partitions & filesystems: fdisk, parted, fsck",
    blurb: "Inspect, partition, check, and mount disks.",
    body: `
<h4>Inspecting block devices</h4>
<pre><code>lsblk                 # tree of disks & partitions
lsblk -f              # + filesystem type & UUID
blkid                 # UUIDs and types
df -h                 # mounted filesystem usage
du -sh /var/*         # directory sizes
sudo fdisk -l         # list all disks & partitions</code></pre>

<h4>Partitioning</h4>
<ul>
  <li><code>fdisk</code> — interactive, MBR & GPT. <code>sudo fdisk /dev/sda</code>
      then <code>n</code> new, <code>d</code> delete, <code>p</code> print, <code>w</code> write, <code>q</code> quit.</li>
  <li><code>parted</code> — scriptable, handles &gt;2 TB (GPT).</li>
</ul>
<pre><code>sudo parted /dev/sdb print
sudo parted /dev/sdb mklabel gpt
sudo parted /dev/sdb mkpart primary ext4 0% 100%</code></pre>

<h4>Creating a filesystem</h4>
<pre><code>sudo mkfs.ext4 /dev/sdb1
sudo mkfs.xfs  /dev/sdb1
sudo mkswap /dev/sdb2 && sudo swapon /dev/sdb2</code></pre>

<h4>Checking & repairing: fsck</h4>
<pre><code>sudo fsck /dev/sdb1        # check (unmount first!)
sudo fsck -y /dev/sdb1     # auto-answer yes to repairs
sudo fsck -f /dev/sdb1     # force even if clean</code></pre>
<p class="warn"><b>Warning:</b> Never run fsck on a mounted, writable filesystem — unmount first with <code>umount</code>.</p>

<h4>Mounting</h4>
<pre><code>sudo mount /dev/sdb1 /mnt/data
sudo umount /mnt/data
mount                       # show current mounts</code></pre>
<p>Persistent mounts go in <code>/etc/fstab</code> (prefer UUID):</p>
<pre><code>UUID=xxxx-xxxx /mnt/data ext4 defaults 0 2</code></pre>
<p class="tip"><b>Exam tip:</b> The last two <code>fstab</code> fields are <em>dump</em> (0) and <em>fsck pass</em> (1 for root, 2 for others, 0 to skip).</p>
`
  },
  {
    section: "2. Managing System Resources",
    id: "cron",
    title: "Scheduling with cron & crontab",
    blurb: "Crontab format, locations, and common schedules.",
    body: `
<h4>The crontab time format (5 fields)</h4>
<pre><code>┌───────── minute        (0-59)
│ ┌─────── hour          (0-23)
│ │ ┌───── day of month  (1-31)
│ │ │ ┌─── month         (1-12)
│ │ │ │ ┌─ day of week   (0-7, 0 & 7 = Sunday)
│ │ │ │ │
* * * * *  command-to-run</code></pre>

<h4>Field syntax</h4>
<ul>
  <li><code>*</code> — every value</li>
  <li><code>*/5</code> — every 5 (step)</li>
  <li><code>1,15,30</code> — a list</li>
  <li><code>9-17</code> — a range</li>
</ul>

<h4>Examples</h4>
<pre><code>0 2 * * *      /backup.sh        # daily at 02:00
*/15 * * * *   /check.sh         # every 15 minutes
0 9 * * 1      /report.sh        # Mondays at 09:00
30 3 1 * *     /monthly.sh       # 03:30 on the 1st
@reboot        /startup.sh       # once at boot</code></pre>

<h4>Where crontabs live</h4>
<ul>
  <li><code>crontab -e</code> — edit the current user's crontab</li>
  <li><code>crontab -l</code> — list it &nbsp; <code>crontab -r</code> — remove it</li>
  <li><code>crontab -u user -e</code> — edit another user's (as root)</li>
  <li>Per-user files: <code>/var/spool/cron/crontabs/</code></li>
  <li>System crontab: <code>/etc/crontab</code> (has an extra <b>user</b> field)</li>
  <li>Drop-in dirs: <code>/etc/cron.d/</code>, and <code>/etc/cron.{hourly,daily,weekly,monthly}/</code></li>
</ul>
<pre><code># /etc/crontab has 6 fields — note the user column:
17 *  * * *  root  cd / && run-parts /etc/cron.hourly</code></pre>
<p class="tip"><b>Exam tip:</b> The <em>system</em> crontab (<code>/etc/crontab</code>, <code>/etc/cron.d/*</code>) has a <b>user</b> field between the schedule and the command; a <em>user</em> crontab does not.</p>
`
  },
  {
    section: "2. Managing System Resources",
    id: "troubleshoot-logs",
    title: "Interpreting logs during troubleshooting",
    blurb: "Read logs to diagnose service, auth, and boot problems.",
    body: `
<h4>A troubleshooting workflow</h4>
<ol>
  <li>Check service status: <code>systemctl status nginx</code></li>
  <li>Read that service's logs: <code>journalctl -u nginx -e</code></li>
  <li>Look at the boot: <code>journalctl -b -p err</code></li>
  <li>Watch live while reproducing: <code>journalctl -f</code> or <code>tail -f</code></li>
</ol>

<h4>Common commands</h4>
<pre><code>systemctl status &lt;svc&gt;         # running? failed? recent log lines
systemctl --failed             # all failed units
journalctl -u &lt;svc&gt; --since today
dmesg | tail                   # kernel ring buffer (hardware/driver)
grep -i fail /var/log/auth.log # failed logins
last                           # recent logins
uptime / free -h / df -h       # quick health check</code></pre>

<h4>Reading log lines</h4>
<p>A syslog line has a timestamp, hostname, process[pid], and message:</p>
<pre><code>Jul 20 14:03:11 web01 sshd[2231]: Failed password for root from 10.0.0.5</code></pre>
<ul>
  <li><b>Timestamp</b> — when &nbsp; <b>web01</b> — host</li>
  <li><b>sshd[2231]</b> — process and PID</li>
  <li>The message tells you what and often who/where</li>
</ul>
<p class="tip"><b>Exam tip:</b> Log priorities (severity) low→high: <code>debug, info, notice, warning, err, crit, alert, emerg</code>. Filter with <code>journalctl -p</code>.</p>
`
  },

  {
    section: "3. Securing Filesystem Access",
    id: "permissions",
    title: "File ownership & permissions",
    blurb: "chmod, chown, octal modes, and special bits.",
    body: `
<h4>Reading <code>ls -l</code></h4>
<pre><code>-rwxr-xr--  1 alice devs  4096 Jul 20 10:00 script.sh
│└┬┘└┬┘└┬┘   │  │     │
│ │  │  └ others: r--   │  └ group
│ │  └ group:  r-x      └ owner
│ └ owner: rwx
└ type: - file, d dir, l symlink</code></pre>

<h4>Permission bits & octal</h4>
<ul>
  <li><code>r</code>=4, <code>w</code>=2, <code>x</code>=1 — add them per class</li>
  <li><code>755</code> = rwx r-x r-x &nbsp; <code>644</code> = rw- r-- r--</li>
  <li><code>600</code> = rw- --- --- &nbsp; <code>700</code> = rwx --- ---</li>
</ul>

<h4>chmod</h4>
<pre><code>chmod 644 file           # octal
chmod u+x script.sh      # add execute for owner
chmod go-w file          # remove write for group & others
chmod -R 755 dir/        # recursive
chmod a+r file           # all classes</code></pre>

<h4>chown / chgrp</h4>
<pre><code>sudo chown alice file
sudo chown alice:devs file      # owner:group
sudo chgrp devs file
sudo chown -R alice:devs dir/</code></pre>

<h4>Special permissions</h4>
<ul>
  <li><b>setuid (4)</b> — <code>chmod u+s</code>: run as file owner (e.g. <code>/usr/bin/passwd</code>)</li>
  <li><b>setgid (2)</b> — <code>chmod g+s</code>: on a dir, new files inherit the group</li>
  <li><b>sticky (1)</b> — <code>chmod +t</code>: on a dir, only owners delete their files (e.g. <code>/tmp</code>)</li>
</ul>

<h4>umask & default permissions</h4>
<p>The umask subtracts from defaults (666 files, 777 dirs). A umask of <code>022</code> yields 644 files, 755 dirs.</p>
<p class="tip"><b>Exam tip:</b> Directories need the <code>x</code> bit to be entered/traversed; <code>r</code> alone only lets you list names.</p>
`
  },
  {
    section: "3. Securing Filesystem Access",
    id: "users-groups",
    title: "Managing users & groups",
    blurb: "useradd, usermod, passwd, and the account files.",
    body: `
<h4>The account files</h4>
<ul>
  <li><code>/etc/passwd</code> — user accounts (name:x:UID:GID:comment:home:shell)</li>
  <li><code>/etc/shadow</code> — hashed passwords & aging (root-only)</li>
  <li><code>/etc/group</code> — groups and their members</li>
</ul>
<pre><code># /etc/passwd fields:
alice:x:1001:1001:Alice,,,:/home/alice:/bin/bash</code></pre>

<h4>Creating & modifying users</h4>
<pre><code>sudo useradd -m -s /bin/bash alice   # -m makes home dir
sudo adduser alice                   # friendlier Debian wrapper
sudo passwd alice                    # set password
sudo usermod -aG sudo alice          # ADD to group (keep others!)
sudo usermod -s /usr/sbin/nologin bob# change shell
sudo usermod -L alice                # lock account
sudo userdel -r alice                # delete + home dir</code></pre>
<p class="warn"><b>Warning:</b> Always use <code>-a</code> with <code>usermod -G</code>. Without <code>-a</code>, you <em>replace</em> the user's supplementary groups.</p>

<h4>Groups</h4>
<pre><code>sudo groupadd devs
sudo gpasswd -a alice devs      # add member
sudo gpasswd -d alice devs      # remove member
groups alice                    # show a user's groups
id alice                        # UID, GID, and groups</code></pre>

<h4>Switching users</h4>
<pre><code>su - alice          # become alice (login shell)
sudo -i             # root login shell
sudo -u alice cmd   # run one command as alice</code></pre>
<p class="tip"><b>Exam tip:</b> System accounts usually have UIDs &lt; 1000; regular users start at 1000 on Ubuntu.</p>
`
  },
  {
    section: "3. Securing Filesystem Access",
    id: "passwords",
    title: "Password complexity & expiry",
    blurb: "chage, PAM pwquality, and login.defs.",
    body: `
<h4>Password aging with chage</h4>
<pre><code>chage -l alice                  # list aging info
sudo chage -M 90 alice          # max age 90 days
sudo chage -m 7 alice           # min days between changes
sudo chage -W 14 alice          # warn 14 days before expiry
sudo chage -E 2026-12-31 alice  # account expiry date
sudo chage -d 0 alice           # force change at next login</code></pre>
<p>These map to fields in <code>/etc/shadow</code>.</p>

<h4>System-wide defaults: /etc/login.defs</h4>
<pre><code>PASS_MAX_DAYS   90
PASS_MIN_DAYS   7
PASS_WARN_AGE   14</code></pre>

<h4>Complexity with PAM (pam_pwquality)</h4>
<p>Edit <code>/etc/security/pwquality.conf</code> (or the pam_pwquality line in
<code>/etc/pam.d/common-password</code>):</p>
<pre><code>minlen = 12        # minimum length
dcredit = -1       # require ≥1 digit
ucredit = -1       # require ≥1 uppercase
lcredit = -1       # require ≥1 lowercase
ocredit = -1       # require ≥1 special char
retry = 3          # allowed tries</code></pre>
<p>Install with <code>sudo apt install libpam-pwquality</code>.</p>
<p class="tip"><b>Exam tip:</b> A <em>negative</em> credit value (e.g. <code>dcredit=-1</code>) means "require at least N of this class." Positive values give a length credit instead.</p>
`
  },
  {
    section: "3. Securing Filesystem Access",
    id: "sudo",
    title: "Interpreting sudo configuration",
    blurb: "sudoers syntax, visudo, and security implications.",
    body: `
<h4>Editing safely: visudo</h4>
<p>Always edit with <code>sudo visudo</code> — it syntax-checks before saving.
Drop-in files go in <code>/etc/sudoers.d/</code>.</p>

<h4>The sudoers rule format</h4>
<pre><code>who   where = (as_whom)   what
alice ALL   = (ALL:ALL)   ALL</code></pre>
<ul>
  <li><b>who</b> — user or <code>%group</code></li>
  <li><b>where</b> — host (usually <code>ALL</code>)</li>
  <li><b>(as_whom)</b> — target user:group</li>
  <li><b>what</b> — commands, or <code>ALL</code></li>
</ul>

<h4>Common examples</h4>
<pre><code>%sudo   ALL=(ALL:ALL) ALL              # the sudo group (Ubuntu default)
%admin  ALL=(ALL) ALL
bob     ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx
web     ALL=(www-data) /usr/bin/php
alice   ALL=(ALL) /usr/bin/apt, /usr/bin/apt-get</code></pre>

<h4>Reading the security implications</h4>
<ul>
  <li><code>NOPASSWD:</code> — no password prompt; convenient but riskier.</li>
  <li><code>(ALL:ALL) ALL</code> — full root; effectively unrestricted.</li>
  <li>Restricting to specific command paths is least-privilege.</li>
  <li>Wildcards/editors can be <b>dangerous</b>: allowing <code>vi</code> or a script that shells out lets a user escape to a root shell.</li>
</ul>
<pre><code>sudo -l          # list what the current user may run
sudo -l -U bob   # list bob's privileges</code></pre>
<p class="tip"><b>Exam tip:</b> Prefer specific command paths over <code>ALL</code>, and remember editors/pagers/interpreters granted via sudo are common privilege-escalation paths.</p>
`
  },
  {
    section: "3. Securing Filesystem Access",
    id: "ssh-keys",
    title: "Creating & managing SSH keys",
    blurb: "ssh-keygen, authorized_keys, and hardening sshd.",
    body: `
<h4>Generating a key pair</h4>
<pre><code>ssh-keygen -t ed25519 -C "alice@laptop"     # modern default
ssh-keygen -t rsa -b 4096 -C "alice@laptop" # RSA alternative</code></pre>
<ul>
  <li>Private key: <code>~/.ssh/id_ed25519</code> — <b>never share</b>, keep <code>600</code>.</li>
  <li>Public key: <code>~/.ssh/id_ed25519.pub</code> — safe to copy to servers.</li>
</ul>

<h4>Installing your key on a server</h4>
<pre><code>ssh-copy-id alice@server        # easiest
# or manually append the .pub to:
#   ~/.ssh/authorized_keys  on the server</code></pre>

<h4>Correct permissions (sshd is strict)</h4>
<pre><code>chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub</code></pre>

<h4>Agent & config</h4>
<pre><code>eval "$(ssh-agent)"; ssh-add ~/.ssh/id_ed25519
# ~/.ssh/config
Host web
    HostName 10.0.0.10
    User alice
    IdentityFile ~/.ssh/id_ed25519</code></pre>

<h4>Hardening the server (/etc/ssh/sshd_config)</h4>
<pre><code>PermitRootLogin no
PasswordAuthentication no        # keys only
PubkeyAuthentication yes
# then:  sudo systemctl restart ssh</code></pre>
<p class="tip"><b>Exam tip:</b> If key auth silently fails, the cause is almost always wrong permissions on <code>~/.ssh</code> or <code>authorized_keys</code> — they must not be group/other writable.</p>
`
  }
];
