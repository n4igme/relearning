# Content Creation Guide for CyberSec Academy Mentors

Welcome to the CyberSec Academy mentor community! This guide will help you create high-quality cybersecurity courses that engage students and deliver real value.

---

## Table of Contents
1. [Course Planning](#course-planning)
2. [Video Recording Best Practices](#video-recording-best-practices)
3. [Creating Engaging Lessons](#creating-engaging-lessons)
4. [Writing Effective Quizzes](#writing-effective-quizzes)
5. [Lab Exercises and Hands-on Content](#lab-exercises-and-hands-on-content)
6. [Technical Requirements](#technical-requirements)
7. [Legal and Ethical Considerations](#legal-and-ethical-considerations)
8. [Course Publishing Checklist](#course-publishing-checklist)

---

## Course Planning

### Before You Start Recording

1. **Define Your Target Audience**
   - Beginner (no prior experience)
   - Intermediate (has basic knowledge)
   - Advanced (experienced practitioners)

2. **Set Clear Learning Objectives**
   - What will students be able to DO after completing your course?
   - Be specific: "Configure Nmap for port scanning" vs. "Learn about Nmap"

3. **Map to Learning Paths**
   - 🔴 Offensive Security (Ethical Hacking track)
   - 🔵 Defensive Security (Security Operations track)
   - 🟣 Both (Foundational skills)

4. **Choose the Right Category**
   - Web Application Security
   - Network Security
   - Cryptography
   - Social Engineering
   - Reverse Engineering
   - Forensics
   - Malware Analysis
   - Cloud Security
   - Mobile Security
   - IoT Security

### Course Structure Template

```
Course
├── Chapter 1: Introduction (1-1.5 hours)
│   ├── Lesson 1.1: Overview (10-15 min)
│   ├── Lesson 1.2: Core Concepts (15-20 min)
│   ├── ... (3-5 lessons total)
│   └── Chapter Quiz (10-15 questions)
├── Chapter 2: Fundamentals (1.5-2 hours)
├── Chapter 3: Practical Application (2-2.5 hours)
├── Chapter 4: Advanced Topics (2-2.5 hours)
├── Chapter 5: Real-World Scenarios (1.5-2 hours)
└── Final Assessment (Comprehensive exam)
```

**Recommended Course Length:**
- Beginner: 8-12 hours
- Intermediate: 12-20 hours
- Advanced: 20-40 hours

---

## Video Recording Best Practices

### Technical Setup

**Screen Recording:**
- **Resolution:** 1920x1080 (Full HD) minimum
- **Frame Rate:** 30 FPS minimum
- **Recording Software:**
  - OBS Studio (Free, open-source)
  - Camtasia (Professional, paid)
  - ScreenFlow (Mac)
  - ShareX (Free, Windows)

**Audio Quality:**
- Use a good microphone (USB condenser mic recommended)
- Record in a quiet environment
- Use noise cancellation if needed
- Test audio levels before each session
- Aim for -12dB to -6dB average level

**Lighting (if using webcam):**
- Face camera with good lighting
- Avoid backlighting
- Use soft, diffused light

### Recording Tips

1. **Script or Outline**
   - Don't read word-for-word (sounds robotic)
   - Have bullet points to stay on track
   - Practice difficult sections beforehand

2. **Pacing**
   - Speak clearly and at a moderate pace
   - Pause after important concepts
   - Give students time to absorb information
   - Don't rush through commands or code

3. **Visual Clarity**
   - Increase terminal font size (16-20pt minimum)
   - Use high-contrast color schemes
   - Zoom in on important details
   - Use cursor highlighting if needed

4. **Engagement**
   - Vary your tone (avoid monotone)
   - Show enthusiasm for the topic
   - Address common questions
   - Relate to real-world scenarios

5. **Editing**
   - Cut out long pauses
   - Remove "um" and "uh" filler words
   - Add captions/subtitles (highly recommended)
   - Include on-screen annotations for key points

### Video Structure

**Opening (30-60 seconds):**
- Lesson title and objectives
- What students will learn
- Why it matters

**Main Content (80-90% of video):**
- Teach one concept at a time
- Demonstrate while explaining
- Show real examples
- Common mistakes to avoid

**Closing (30-60 seconds):**
- Recap key takeaways
- Preview next lesson
- Encourage practice

### Ideal Lesson Length
- **Short lessons:** 8-15 minutes (single concept)
- **Medium lessons:** 15-25 minutes (multi-step process)
- **Long lessons:** 25-35 minutes (complex topic with demo)

**Avoid lessons over 40 minutes** - split into multiple parts instead.

---

## Creating Engaging Lessons

### The Learning Pyramid

**Retention Rates:**
- Lecture: 5%
- Reading: 10%
- Audio-Visual: 20%
- Demonstration: 30%
- Practice: 75%
- Teaching Others: 90%

**Application:** Combine methods for maximum retention!

### Effective Teaching Techniques

1. **Start with "Why"**
   - Explain the relevance before the technical details
   - Connect to real-world scenarios
   - Show the impact of the skill

2. **Show, Then Tell**
   - Demonstrate the end result first
   - Then explain how to get there
   - Builds excitement and context

3. **Break Down Complex Topics**
   - Use the "chunking" method
   - Teach in small, digestible pieces
   - Build complexity gradually

4. **Use Analogies and Metaphors**
   - "A firewall is like a bouncer at a club"
   - "SQL injection is like sneaking commands into a conversation"
   - Makes abstract concepts concrete

5. **Provide Context**
   - When was this technique discovered?
   - Why does this vulnerability exist?
   - How common is this in the real world?

### Visual Aids

- **Diagrams:** Network topologies, attack flows, system architectures
- **Flowcharts:** Decision trees, processes, workflows
- **Screenshots:** Highlight important areas with arrows/boxes
- **Code Highlighting:** Use syntax highlighting, comment important lines
- **Animations:** Show progression, data flow, packet movement

**Tools:**
- Draw.io (Free diagrams)
- Excalidraw (Simple sketches)
- Lucidchart (Professional diagrams)
- Carbon (Beautiful code screenshots)

---

## Writing Effective Quizzes

### Quiz Design Principles

**Purpose:**
- Reinforce learning (not just test memorization)
- Identify knowledge gaps
- Build confidence
- Prepare for real-world application

### Question Types

#### 1. Multiple Choice (Best for concepts)

**Good Example:**
```
Q: What is the primary purpose of reconnaissance in penetration testing?

A) To exploit vulnerabilities
B) To gather information about the target *[CORRECT]*
C) To cover tracks after an attack
D) To maintain access to systems

Explanation: Reconnaissance is the information-gathering phase that
occurs before exploitation attempts.
```

**Tips:**
- Make all options plausible
- Avoid "all of the above" and "none of the above"
- Keep option lengths similar
- One clearly correct answer

#### 2. True/False (Best for facts)

**Good Example:**
```
Q: Port 443 is the default port for HTTPS traffic.

True *[CORRECT]*
False

Explanation: Port 443 is indeed the standard port for HTTPS, while
port 80 is used for HTTP.
```

**Tips:**
- Avoid tricky wording
- Don't use negatives ("not," "never")
- Test important facts, not trivia

#### 3. Scenario-Based (Best for application)

**Good Example:**
```
Q: You discover a web application vulnerable to SQL injection. What
is the FIRST step you should take?

A) Immediately exploit it to extract data
B) Verify you have written authorization to test *[CORRECT]*
C) Post about it on social media
D) Ignore it and move on

Explanation: Always ensure you have proper authorization before
testing any system. Unauthorized access is illegal.
```

### Quiz Creation Guidelines

**Quantity:**
- Chapter quizzes: 10-20 questions
- Final exam: 40-60 questions

**Difficulty Distribution:**
- 60% Easy (reinforces concepts)
- 30% Medium (requires understanding)
- 10% Hard (tests deeper knowledge)

**Passing Scores:**
- Chapter quizzes: 70%
- Final exam: 75-80%

**Feedback:**
- Always explain why an answer is correct
- Point out common misconceptions
- Reference the lesson where concept was taught

### Question Writing Checklist

- [ ] Tests a specific learning objective
- [ ] Clear and unambiguous wording
- [ ] Free from spelling/grammar errors
- [ ] Not trick questions
- [ ] Plausible distractors (wrong answers)
- [ ] Explanation provided for correct answer
- [ ] Appropriate difficulty level
- [ ] Relevant to course content

---

## Lab Exercises and Hands-on Content

### Types of Labs

1. **Guided Labs (Follow-along)**
   - Step-by-step instructions
   - Expected output shown
   - Good for learning new tools

2. **Challenge Labs (Try-it-yourself)**
   - Objective given, methods not specified
   - Multiple solutions possible
   - Good for practicing skills

3. **CTF-Style Challenges**
   - Find flags hidden in vulnerable systems
   - Competitive element
   - Great for engagement

### Lab Environment Options

**For Students:**
- Personal VMs (VirtualBox/VMware)
- Cloud-based labs (AWS, Azure)
- Purpose-built platforms (TryHackMe, HackTheBox)
- Docker containers

**For Instructors:**
- Provide VM download links
- Include setup guides
- Offer cloud lab alternatives
- Create Docker environments

### Lab Documentation

**Include:**
1. **Objective:** What will students accomplish?
2. **Prerequisites:** What knowledge/tools needed?
3. **Setup Instructions:** How to prepare environment
4. **Step-by-Step Guide:** Detailed walkthrough (for guided labs)
5. **Expected Results:** What success looks like
6. **Troubleshooting:** Common issues and solutions
7. **Additional Challenges:** Extension activities

**Example Lab Template:**

```markdown
# Lab: Nmap Port Scanning

**Objective:** Learn to use Nmap for network reconnaissance

**Prerequisites:**
- Kali Linux VM installed
- Metasploitable VM running
- Basic command line knowledge

**Setup:**
1. Start both VMs
2. Note Metasploitable IP address (ip addr)
3. Verify connectivity with ping

**Tasks:**
1. Perform a basic scan: `nmap [target-ip]`
2. Scan all ports: `nmap -p- [target-ip]`
3. Detect services: `nmap -sV [target-ip]`
4. Identify OS: `sudo nmap -O [target-ip]`

**Expected Results:**
You should discover 20+ open ports including:
- Port 21 (FTP)
- Port 22 (SSH)
- Port 80 (HTTP)
[etc.]

**Challenge:**
Can you identify which service has a known backdoor?
```

### Safety and Legal Considerations

**Always Include:**
- "Only test systems you own or have written permission to test"
- "This is for educational purposes only"
- "Unauthorized access is illegal"
- Lab disclaimer at the beginning of each hands-on section

**Recommended Lab Environments:**
- Isolated networks
- Purpose-built vulnerable VMs
- Proper firewall rules
- No production systems

---

## Technical Requirements

### Video Upload

**Hosting Options:**
- **Cloudinary:** Recommended for CyberSec Academy
- **YouTube:** Unlisted videos, embed
- **Vimeo:** Professional hosting

**Video Specifications:**
- Format: MP4 (H.264 codec)
- Resolution: 1920x1080
- Bitrate: 5-10 Mbps
- Audio: AAC, 128-192 kbps

### File Size Management

**Compression:**
- Use HandBrake for efficient compression
- Balance quality and file size
- Target: 100-200 MB per 10 minutes

**Cloudinary Tips:**
- Upload directly to Cloudinary
- Get public URL or public_id
- Add to lesson as video_url or cloudinary_public_id

### Course Materials

**Downloadable Resources:**
- Cheat sheets (PDF)
- Code samples (GitHub repository)
- Configuration files
- VM images (links to external hosting)
- Slide decks (optional)

**File Formats:**
- Documents: PDF (for portability)
- Code: .txt or .sh/.ps1 (plain text)
- Archives: .zip (widely supported)

---

## Legal and Ethical Considerations

### Required Disclaimers

**Start of Every Course:**
```
LEGAL DISCLAIMER:
This course is for educational and authorized testing purposes only.
Unauthorized access to computer systems is illegal under the Computer
Fraud and Abuse Act and similar laws worldwide. Always obtain written
permission before testing any system you do not own. The instructor
and platform are not responsible for misuse of this information.
```

**For Offensive Security Courses:**
- Emphasize authorization repeatedly
- Show examples of proper authorization forms
- Discuss legal consequences
- Teach responsible disclosure

**For Defensive Security Courses:**
- Privacy considerations during investigations
- Legal requirements for breach notification
- Data handling best practices
- Chain of custody for evidence

### Content Restrictions

**Do NOT Include:**
- Live exploits against real websites (without permission)
- Personally identifiable information (PII)
- Actual malware samples (use defanged versions)
- Credentials to real systems
- Techniques exclusively for illegal activities

### Ethical Teaching

**Emphasize:**
- Legal frameworks
- Responsible disclosure
- Professional ethics
- Victim impact
- Career consequences of illegal activity

**Avoid:**
- "Gray area" techniques without context
- Encouraging illegal activities
- Sensationalizing hacking
- Providing tools without explaining risks

---

## Course Publishing Checklist

### Before Submitting for Approval

- [ ] All videos recorded and uploaded
- [ ] Course structure complete (chapters and lessons)
- [ ] Learning objectives defined
- [ ] Quizzes created for each chapter
- [ ] Final assessment complete
- [ ] Course description written
- [ ] Prerequisites listed
- [ ] Thumbnail image created (1280x720px)
- [ ] Price set (or marked as free)
- [ ] Category and difficulty selected
- [ ] Learning path specified (Offensive/Defensive/Both)
- [ ] Legal disclaimers included
- [ ] All videos tested (play correctly)
- [ ] No copyrighted content without permission
- [ ] Professional quality (audio, video, content)

### Quality Standards

**Minimum Requirements:**
- Clear audio (no background noise)
- Readable screen (16pt+ font)
- No excessive filler words or long pauses
- Logical lesson progression
- Working demos and examples
- Accurate technical information

**Professional Polish:**
- Intro/outro (optional but recommended)
- Consistent branding
- Chapter transitions
- On-screen annotations
- Captions/subtitles
- Downloadable resources

### Course Review Process

1. **Self-Review:** Test all videos, quizzes, and labs
2. **Peer Review:** Have another mentor review (optional)
3. **Submit for Approval:** Mark course as ready
4. **Admin Review:** Platform admins will review content
5. **Revisions:** Address any feedback
6. **Publication:** Course goes live for students

**Review Timeline:** 3-5 business days

---

## Best Practices Summary

### Do's ✅
- Plan before recording
- Use high-quality equipment
- Speak clearly and at a moderate pace
- Show real-world applications
- Provide hands-on practice
- Include quizzes for reinforcement
- Update content regularly
- Respond to student questions
- Follow ethical guidelines
- Have fun teaching!

### Don'ts ❌
- Rush through content
- Use poor audio quality
- Read monotonously from slides
- Skip practical demonstrations
- Ignore student feedback
- Teach outdated techniques
- Violate legal/ethical boundaries
- Plagiarize content
- Over-complicate simple concepts
- Forget legal disclaimers

---

## Resources for Mentors

### Recording Tools
- **OBS Studio:** https://obsproject.com/
- **Audacity:** Free audio editing
- **HandBrake:** Video compression
- **ShareX:** Screen capture (Windows)

### Diagram Tools
- **Draw.io:** https://app.diagrams.net/
- **Excalidraw:** https://excalidraw.com/
- **Lucidchart:** Professional diagramming

### Learning Resources
- **MITRE ATT&CK:** Threat tactics and techniques
- **OWASP:** Web application security
- **NIST:** Standards and frameworks
- **SANS Reading Room:** Research papers

### Communities
- CyberSec Academy Mentor Forum
- r/cybersecurity (Reddit)
- InfoSec Twitter community
- DEF CON and Black Hat talks

---

## Getting Help

**Questions?** Contact us:
- Mentor Forum: (link to forum)
- Email: mentors@cybersecacademy.com
- Discord: CyberSec Academy Mentors channel

**Need Technical Help?**
- Video upload issues
- Platform questions
- Course management
- Student interaction

We're here to support you in creating amazing courses!

---

## Course Templates

Looking for a starting point? Check out our sample course structures:
- [Introduction to Ethical Hacking Template](./courses/intro-ethical-hacking.md)
- [Introduction to Blue Team Operations Template](./courses/intro-blue-team-operations.md)

These templates include:
- Complete chapter outlines
- Lesson descriptions
- Learning objectives
- Sample quiz questions
- Lab exercise ideas
- Recommended durations

Use them as inspiration or starting points for your own courses!

---

**Good luck with your course creation!**

Remember: You're not just teaching skills—you're shaping the next generation of cybersecurity professionals. Your expertise and passion make a difference.

🛡️ **Happy Teaching!**

---

**Version:** 1.0
**Last Updated:** January 2026
