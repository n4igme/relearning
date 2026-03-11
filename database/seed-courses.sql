-- =====================================================
-- COURSE CONTENT SEED DATA
-- =====================================================
-- Run this AFTER seed-skills.sql and BEFORE link-tools-to-courses.sql
-- This seeds 7 courses: 2 main courses with full content + 5 placeholder courses
-- Main courses: Introduction to Ethical Hacking, Introduction to Blue Team Operations
-- Placeholder courses: Web App Security, Network Security, Penetration Testing, Cryptography, Exploit Development

DO $$
DECLARE
    v_instructor_id UUID;
    -- Main course IDs
    v_course_eth_hack_id UUID;
    v_course_blue_team_id UUID;
    -- Material IDs (chapters) - Ethical Hacking
    v_eth_ch1_id UUID;
    v_eth_ch2_id UUID;
    v_eth_ch3_id UUID;
    v_eth_ch4_id UUID;
    v_eth_ch5_id UUID;
    -- Material IDs (chapters) - Blue Team
    v_bt_ch1_id UUID;
    v_bt_ch2_id UUID;
    v_bt_ch3_id UUID;
    v_bt_ch4_id UUID;
    v_bt_ch5_id UUID;
    -- Quest IDs
    v_eth_quest_ch1_id UUID;
    v_bt_quest_ch1_id UUID;
    -- Question IDs (reusable)
    v_question_id UUID;
BEGIN
    -- =====================================================
    -- 1. RESOLVE INSTRUCTOR ID
    -- =====================================================
    SELECT id INTO v_instructor_id
    FROM public.profiles
    WHERE role IN ('admin', 'mentor') AND is_approved = true
    ORDER BY created_at
    LIMIT 1;

    IF v_instructor_id IS NULL THEN
        RAISE EXCEPTION 'No approved admin or mentor found. Please create one first.';
    END IF;

    RAISE NOTICE 'Using instructor ID: %', v_instructor_id;

    -- =====================================================
    -- 2. INSERT COURSES
    -- =====================================================

    -- Main Course 1: Introduction to Ethical Hacking
    INSERT INTO public.courses (title, slug, description, short_description, category, difficulty, price, is_published, is_approved, instructor_id)
    VALUES (
        'Introduction to Ethical Hacking',
        'intro-ethical-hacking',
        'Master the fundamentals of ethical hacking and penetration testing. Learn the methodologies, tools, and techniques used by security professionals to identify and exploit vulnerabilities in systems while staying within legal and ethical boundaries.',
        'Master the fundamentals of ethical hacking and penetration testing.',
        'Web Application Security',
        'beginner',
        0,
        true,
        true,
        v_instructor_id
    ) ON CONFLICT (slug) DO NOTHING;

    -- Main Course 2: Introduction to Blue Team Operations
    INSERT INTO public.courses (title, slug, description, short_description, category, difficulty, price, is_published, is_approved, instructor_id)
    VALUES (
        'Introduction to Blue Team Operations',
        'intro-blue-team-operations',
        'Learn the fundamentals of defensive security and blue team operations. Master the skills needed to detect, analyze, and respond to cyber threats.',
        'Learn the fundamentals of defensive security and blue team operations.',
        'Network Security',
        'beginner',
        0,
        true,
        true,
        v_instructor_id
    ) ON CONFLICT (slug) DO NOTHING;

    -- Placeholder Course 1: Web Application Security Fundamentals
    INSERT INTO public.courses (title, slug, description, short_description, category, difficulty, price, is_published, is_approved, instructor_id)
    VALUES (
        'Web Application Security Fundamentals',
        'web-app-security-fundamentals',
        'Learn the core principles of web application security including common vulnerabilities, secure coding practices, and defensive strategies.',
        'Learn the core principles of web application security.',
        'Web Application Security',
        'beginner',
        49.99,
        true,
        true,
        v_instructor_id
    ) ON CONFLICT (slug) DO NOTHING;

    -- Placeholder Course 2: Network Security and Penetration Testing
    INSERT INTO public.courses (title, slug, description, short_description, category, difficulty, price, is_published, is_approved, instructor_id)
    VALUES (
        'Network Security and Penetration Testing',
        'network-security-pentest',
        'Explore network security concepts and penetration testing methodologies to identify and remediate network vulnerabilities.',
        'Explore network security concepts and penetration testing methodologies.',
        'Network Security',
        'intermediate',
        79.99,
        true,
        true,
        v_instructor_id
    ) ON CONFLICT (slug) DO NOTHING;

    -- Placeholder Course 3: Professional Penetration Testing
    INSERT INTO public.courses (title, slug, description, short_description, category, difficulty, price, is_published, is_approved, instructor_id)
    VALUES (
        'Professional Penetration Testing',
        'professional-penetration-testing',
        'Advanced penetration testing techniques for professional security assessors covering enterprise environments and complex attack scenarios.',
        'Advanced penetration testing techniques for professional security assessors.',
        'Penetration Testing',
        'advanced',
        99.99,
        true,
        true,
        v_instructor_id
    ) ON CONFLICT (slug) DO NOTHING;

    -- Placeholder Course 4: Applied Cryptography
    INSERT INTO public.courses (title, slug, description, short_description, category, difficulty, price, is_published, is_approved, instructor_id)
    VALUES (
        'Applied Cryptography',
        'applied-cryptography',
        'Understand and apply cryptographic algorithms, protocols, and best practices for securing data in transit and at rest.',
        'Understand and apply cryptographic algorithms and protocols.',
        'Cryptography',
        'intermediate',
        69.99,
        true,
        true,
        v_instructor_id
    ) ON CONFLICT (slug) DO NOTHING;

    -- Placeholder Course 5: Binary Exploitation and Exploit Development
    INSERT INTO public.courses (title, slug, description, short_description, category, difficulty, price, is_published, is_approved, instructor_id)
    VALUES (
        'Binary Exploitation and Exploit Development',
        'exploit-development',
        'Dive deep into binary exploitation, reverse engineering, and exploit development techniques for low-level security research.',
        'Dive deep into binary exploitation and exploit development techniques.',
        'Reverse Engineering',
        'advanced',
        149.99,
        true,
        true,
        v_instructor_id
    ) ON CONFLICT (slug) DO NOTHING;

    -- Retrieve main course IDs
    SELECT id INTO v_course_eth_hack_id FROM public.courses WHERE slug = 'intro-ethical-hacking';
    SELECT id INTO v_course_blue_team_id FROM public.courses WHERE slug = 'intro-blue-team-operations';

    RAISE NOTICE 'Inserted/verified 7 courses. Ethical Hacking ID: %, Blue Team ID: %', v_course_eth_hack_id, v_course_blue_team_id;

    -- =====================================================
    -- 3. INSERT MATERIALS (CHAPTERS) - ETHICAL HACKING
    -- =====================================================

    -- Chapter 1: Introduction to Cybersecurity & Ethical Hacking
    INSERT INTO public.materials (course_id, title, description, order_index)
    SELECT v_course_eth_hack_id, 'Introduction to Cybersecurity & Ethical Hacking', 'Understanding the fundamentals of cybersecurity, ethical hacking principles, legal considerations, and penetration testing methodology', 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.materials WHERE course_id = v_course_eth_hack_id AND title = 'Introduction to Cybersecurity & Ethical Hacking'
    );
    SELECT id INTO v_eth_ch1_id FROM public.materials WHERE course_id = v_course_eth_hack_id AND title = 'Introduction to Cybersecurity & Ethical Hacking';

    -- Chapter 2: Reconnaissance Fundamentals
    INSERT INTO public.materials (course_id, title, description, order_index)
    SELECT v_course_eth_hack_id, 'Reconnaissance Fundamentals', 'Active and passive reconnaissance techniques, OSINT tools, web application reconnaissance, and documentation', 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.materials WHERE course_id = v_course_eth_hack_id AND title = 'Reconnaissance Fundamentals'
    );
    SELECT id INTO v_eth_ch2_id FROM public.materials WHERE course_id = v_course_eth_hack_id AND title = 'Reconnaissance Fundamentals';

    -- Chapter 3: Scanning and Enumeration
    INSERT INTO public.materials (course_id, title, description, order_index)
    SELECT v_course_eth_hack_id, 'Scanning and Enumeration', 'Network scanning with Nmap, service enumeration, vulnerability scanning, web application scanning, and wireless network scanning', 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.materials WHERE course_id = v_course_eth_hack_id AND title = 'Scanning and Enumeration'
    );
    SELECT id INTO v_eth_ch3_id FROM public.materials WHERE course_id = v_course_eth_hack_id AND title = 'Scanning and Enumeration';

    -- Chapter 4: Introduction to Exploitation
    INSERT INTO public.materials (course_id, title, description, order_index)
    SELECT v_course_eth_hack_id, 'Introduction to Exploitation', 'Understanding vulnerabilities, Metasploit framework, basic exploitation techniques, web application vulnerabilities, password attacks, and shells', 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.materials WHERE course_id = v_course_eth_hack_id AND title = 'Introduction to Exploitation'
    );
    SELECT id INTO v_eth_ch4_id FROM public.materials WHERE course_id = v_course_eth_hack_id AND title = 'Introduction to Exploitation';

    -- Chapter 5: Post-Exploitation and Reporting
    INSERT INTO public.materials (course_id, title, description, order_index)
    SELECT v_course_eth_hack_id, 'Post-Exploitation and Reporting', 'Privilege escalation, maintaining access, understanding attacker techniques, penetration testing report writing, and next steps', 5
    WHERE NOT EXISTS (
        SELECT 1 FROM public.materials WHERE course_id = v_course_eth_hack_id AND title = 'Post-Exploitation and Reporting'
    );
    SELECT id INTO v_eth_ch5_id FROM public.materials WHERE course_id = v_course_eth_hack_id AND title = 'Post-Exploitation and Reporting';

    RAISE NOTICE 'Inserted/verified 5 materials for Ethical Hacking course';

    -- =====================================================
    -- 4. INSERT SUB_MATERIALS (LESSONS) - ETHICAL HACKING
    -- =====================================================

    -- ---- Chapter 1: Introduction to Cybersecurity & Ethical Hacking (5 lessons) ----

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch1_id, 'What is Ethical Hacking?', 'Definition of ethical hacking vs. malicious hacking. The role of penetration testers in cybersecurity. Real-world examples of ethical hacking impact. Career paths in offensive security.', 1, true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch1_id AND title = 'What is Ethical Hacking?'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch1_id, 'Types of Hackers', 'White Hat, Black Hat, Gray Hat hackers. Script Kiddies vs. Advanced Persistent Threats (APTs). Hacktivists and Nation-State Actors.', 2, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch1_id AND title = 'Types of Hackers'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch1_id, 'Legal and Ethical Considerations', 'Computer Fraud and Abuse Act (CFAA). Authorized testing vs. unauthorized access. Rules of engagement. NDAs and responsible disclosure.', 3, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch1_id AND title = 'Legal and Ethical Considerations'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch1_id, 'Penetration Testing Methodology', 'The 5 phases of penetration testing: Reconnaissance, Scanning, Gaining Access, Maintaining Access, Covering Tracks. OWASP Testing Guide and PTES overview.', 4, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch1_id AND title = 'Penetration Testing Methodology'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch1_id, 'Setting Up Your Lab Environment', 'Virtual machine basics with VirtualBox/VMware. Installing Kali Linux. Setting up vulnerable machines like Metasploitable and DVWA. Lab safety and isolation.', 5, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch1_id AND title = 'Setting Up Your Lab Environment'
    );

    -- ---- Chapter 2: Reconnaissance Fundamentals (6 lessons) ----

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch2_id, 'Introduction to Reconnaissance', 'Active vs. Passive reconnaissance. The reconnaissance kill chain. Why reconnaissance is crucial in penetration testing.', 1, true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch2_id AND title = 'Introduction to Reconnaissance'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch2_id, 'Passive Reconnaissance Techniques', 'Google Dorking, WHOIS lookups, DNS enumeration, subdomain discovery, email harvesting with theHarvester, social media OSINT.', 2, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch2_id AND title = 'Passive Reconnaissance Techniques'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch2_id, 'OSINT Tools and Techniques', 'Maltego for relationship mapping, Recon-ng framework, SpiderFoot automation, finding leaked credentials, GitHub and LinkedIn reconnaissance.', 3, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch2_id AND title = 'OSINT Tools and Techniques'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch2_id, 'Active Reconnaissance', 'Ping sweeps and host discovery, traceroute analysis, banner grabbing, social engineering basics, physical reconnaissance.', 4, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch2_id AND title = 'Active Reconnaissance'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch2_id, 'Web Application Reconnaissance', 'robots.txt and sitemap.xml analysis, technology fingerprinting, WAF detection, certificate transparency logs, hidden directories.', 5, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch2_id AND title = 'Web Application Reconnaissance'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch2_id, 'Documentation and Note-Taking', 'Importance of documentation, note-taking tools like CherryTree and Obsidian, screenshot best practices, creating a reconnaissance report.', 6, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch2_id AND title = 'Documentation and Note-Taking'
    );

    -- ---- Chapter 3: Scanning and Enumeration (7 lessons) ----

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch3_id, 'Introduction to Network Scanning', 'OSI model review focusing on layers 3-7. TCP/IP fundamentals. TCP three-way handshake. Common ports and services.', 1, true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch3_id AND title = 'Introduction to Network Scanning'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch3_id, 'Port Scanning with Nmap', 'Nmap scan types: SYN, Connect, UDP. Service version detection. OS detection. Timing options and output formats. Stealth scanning.', 2, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch3_id AND title = 'Port Scanning with Nmap'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch3_id, 'Service Enumeration', 'Banner grabbing with netcat. Enumerating FTP, SSH, HTTP/HTTPS, SMB, and database services using nmap NSE scripts and enum4linux.', 3, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch3_id AND title = 'Service Enumeration'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch3_id, 'Vulnerability Scanning', 'Difference between scanning and exploitation. Nessus and OpenVAS basics. Nmap vulnerability scripts. CVE database and CVSS scoring.', 4, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch3_id AND title = 'Vulnerability Scanning'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch3_id, 'Web Application Scanning', 'Directory brute-forcing with dirb, gobuster, and ffuf. Finding hidden files and admin panels. API endpoint discovery.', 5, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch3_id AND title = 'Web Application Scanning'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch3_id, 'Wireless Network Scanning', '802.11 wireless standards. WiFi security protocols. Aircrack-ng suite overview. Monitoring mode and finding hidden SSIDs.', 6, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch3_id AND title = 'Wireless Network Scanning'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch3_id, 'Interpreting Scan Results', 'Reading Nmap output. Identifying attack surface. Prioritizing targets. Creating an enumeration report.', 7, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch3_id AND title = 'Interpreting Scan Results'
    );

    -- ---- Chapter 4: Introduction to Exploitation (8 lessons) ----

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch4_id, 'Understanding Vulnerabilities', 'Common vulnerability types: buffer overflows, SQL injection, XSS, RCE, authentication bypass. OWASP Top 10. CVE and NVD databases.', 1, true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch4_id AND title = 'Understanding Vulnerabilities'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch4_id, 'Introduction to Metasploit Framework', 'Metasploit architecture: modules, exploits, payloads. msfconsole basics. Searching for exploits. Understanding payloads.', 2, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch4_id AND title = 'Introduction to Metasploit Framework'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch4_id, 'Basic Exploitation Techniques', 'Using Metasploit to exploit common vulnerabilities. Exploiting unpatched services. Default credentials. Using public exploits safely.', 3, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch4_id AND title = 'Basic Exploitation Techniques'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch4_id, 'Web Application Vulnerabilities', 'SQL Injection basics and SQLmap. Cross-Site Scripting introduction. Command injection. File inclusion vulnerabilities (LFI/RFI).', 4, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch4_id AND title = 'Web Application Vulnerabilities'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch4_id, 'Password Attacks', 'Hash cracking fundamentals. John the Ripper and Hashcat. Dictionary attacks vs. brute force. Rainbow tables. Password spraying.', 5, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch4_id AND title = 'Password Attacks'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch4_id, 'Shells and Reverse Shells', 'Types of shells: bind shell, reverse shell. Netcat listeners. Generating payloads with msfvenom. Upgrading shells.', 6, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch4_id AND title = 'Shells and Reverse Shells'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch4_id, 'Post-Exploitation Basics', 'Information gathering after compromise. User enumeration. Checking sudo privileges. Finding sensitive files. Lateral movement concepts.', 7, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch4_id AND title = 'Post-Exploitation Basics'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch4_id, 'Responsible Exploitation', 'Testing in safe environments only. Verifying scope. Documenting every action. Reporting findings responsibly. Coordinated disclosure.', 8, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch4_id AND title = 'Responsible Exploitation'
    );

    -- ---- Chapter 5: Post-Exploitation and Reporting (5 lessons) ----

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch5_id, 'Privilege Escalation Introduction', 'Why privilege escalation matters. Linux privilege escalation basics. Finding SUID binaries. Windows privilege escalation overview.', 1, true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch5_id AND title = 'Privilege Escalation Introduction'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch5_id, 'Maintaining Access', 'Creating backdoors ethically. SSH key persistence. Cron job backdoors. Web shells. Cleanup after testing.', 2, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch5_id AND title = 'Maintaining Access'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch5_id, 'Understanding How Attackers Cover Tracks', 'Log deletion techniques for understanding attacker behavior. Common log locations. Timestomping. Ethical distinction for penetration testers.', 3, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch5_id AND title = 'Understanding How Attackers Cover Tracks'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch5_id, 'Penetration Testing Report Writing', 'Executive summary. Technical findings. Vulnerability severity ratings. Proof of concept. Remediation recommendations.', 4, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch5_id AND title = 'Penetration Testing Report Writing'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_eth_ch5_id, 'Course Wrap-Up and Next Steps', 'Recap of key concepts. Certifications: OSCP, CEH, eJPT. Practice platforms: HackTheBox, TryHackMe. Building a home lab.', 5, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_eth_ch5_id AND title = 'Course Wrap-Up and Next Steps'
    );

    RAISE NOTICE 'Inserted/verified 31 sub_materials for Ethical Hacking course';

    -- =====================================================
    -- 5. INSERT MATERIALS (CHAPTERS) - BLUE TEAM
    -- =====================================================

    -- Chapter 1: Introduction to Defensive Security
    INSERT INTO public.materials (course_id, title, description, order_index)
    SELECT v_course_blue_team_id, 'Introduction to Defensive Security', 'Understanding the fundamentals of defensive security, the blue team role, security operations centers, and the cyber threat landscape', 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.materials WHERE course_id = v_course_blue_team_id AND title = 'Introduction to Defensive Security'
    );
    SELECT id INTO v_bt_ch1_id FROM public.materials WHERE course_id = v_course_blue_team_id AND title = 'Introduction to Defensive Security';

    -- Chapter 2: Security Monitoring Basics
    INSERT INTO public.materials (course_id, title, description, order_index)
    SELECT v_course_blue_team_id, 'Security Monitoring Basics', 'Log management, SIEM fundamentals, network traffic analysis, endpoint monitoring, and alert triage', 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.materials WHERE course_id = v_course_blue_team_id AND title = 'Security Monitoring Basics'
    );
    SELECT id INTO v_bt_ch2_id FROM public.materials WHERE course_id = v_course_blue_team_id AND title = 'Security Monitoring Basics';

    -- Chapter 3: Threat Detection
    INSERT INTO public.materials (course_id, title, description, order_index)
    SELECT v_course_blue_team_id, 'Threat Detection', 'Intrusion detection systems, threat intelligence, behavioral analysis, malware detection, and detection engineering', 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.materials WHERE course_id = v_course_blue_team_id AND title = 'Threat Detection'
    );
    SELECT id INTO v_bt_ch3_id FROM public.materials WHERE course_id = v_course_blue_team_id AND title = 'Threat Detection';

    -- Chapter 4: Incident Response Fundamentals
    INSERT INTO public.materials (course_id, title, description, order_index)
    SELECT v_course_blue_team_id, 'Incident Response Fundamentals', 'Incident response lifecycle, triage and classification, containment strategies, evidence collection, and recovery procedures', 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.materials WHERE course_id = v_course_blue_team_id AND title = 'Incident Response Fundamentals'
    );
    SELECT id INTO v_bt_ch4_id FROM public.materials WHERE course_id = v_course_blue_team_id AND title = 'Incident Response Fundamentals';

    -- Chapter 5: Security Tools and Technologies
    INSERT INTO public.materials (course_id, title, description, order_index)
    SELECT v_course_blue_team_id, 'Security Tools and Technologies', 'Firewalls, endpoint protection, network security tools, forensic tools, and security automation', 5
    WHERE NOT EXISTS (
        SELECT 1 FROM public.materials WHERE course_id = v_course_blue_team_id AND title = 'Security Tools and Technologies'
    );
    SELECT id INTO v_bt_ch5_id FROM public.materials WHERE course_id = v_course_blue_team_id AND title = 'Security Tools and Technologies';

    RAISE NOTICE 'Inserted/verified 5 materials for Blue Team course';

    -- =====================================================
    -- 6. INSERT SUB_MATERIALS (LESSONS) - BLUE TEAM
    -- =====================================================

    -- ---- Chapter 1: Introduction to Defensive Security (5 lessons) ----

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch1_id, 'What is Blue Team Security?', 'Offensive vs. Defensive security. The role of blue teams in cybersecurity. Blue team vs. Red team vs. Purple team. Career paths in defensive security. Security Operations Center (SOC) overview.', 1, true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch1_id AND title = 'What is Blue Team Security?'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch1_id, 'The Cybersecurity Landscape', 'Current threat landscape. Common threat actors including APTs, cybercriminals, and hacktivists. Attack motivations such as financial gain, espionage, and disruption. Recent major security incidents. The cost of cyber attacks.', 2, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch1_id AND title = 'The Cybersecurity Landscape'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch1_id, 'Defense-in-Depth Strategy', 'Layered security approach. People, Process, Technology framework. The security triad: Prevention, Detection, Response. CIA Triad covering Confidentiality, Integrity, and Availability. Security controls including Preventive, Detective, and Corrective. Zero Trust principles.', 3, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch1_id AND title = 'Defense-in-Depth Strategy'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch1_id, 'Incident Response Lifecycle', 'NIST Incident Response Framework phases: Preparation, Detection and Analysis, Containment Eradication and Recovery, Post-Incident Activity. Incident classification and severity levels. Escalation procedures. Incident response team roles.', 4, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch1_id AND title = 'Incident Response Lifecycle'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch1_id, 'Blue Team Tools Landscape', 'SIEM platforms such as Splunk, ELK, and QRadar. Endpoint Detection and Response (EDR). Intrusion Detection Systems (IDS). Network monitoring tools. Ticketing systems. Threat intelligence platforms. Open-source vs. commercial tools.', 5, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch1_id AND title = 'Blue Team Tools Landscape'
    );

    -- ---- Chapter 2: Security Monitoring Basics (6 lessons) ----

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch2_id, 'Introduction to Security Monitoring', 'What is security monitoring. Continuous monitoring vs. periodic assessments. Key metrics and KPIs for SOC. Alert fatigue and false positives. Building a monitoring strategy. The importance of baseline behavior.', 1, true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch2_id AND title = 'Introduction to Security Monitoring'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch2_id, 'Log Collection and Analysis', 'Types of logs: system, application, network, and security logs. Log formats including JSON, CEF, and Syslog. Centralized logging importance. Log retention and compliance. Windows Event Logs and common Event IDs. Linux log locations.', 2, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch2_id AND title = 'Log Collection and Analysis'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch2_id, 'SIEM Fundamentals', 'What is a SIEM and how it works: Collect, Normalize, Correlate, Alert. Use cases for SIEM. Introduction to Splunk and ELK stack. Creating basic searches. Understanding events and fields. Building simple dashboards.', 3, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch2_id AND title = 'SIEM Fundamentals'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch2_id, 'Creating Alerts and Rules', 'Alert logic and conditions. Correlation rules. Tuning alerts to reduce false positives. Alert priorities from Critical to Informational. Alert workflows. Playbooks for common alerts.', 4, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch2_id AND title = 'Creating Alerts and Rules'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch2_id, 'Network Security Monitoring (NSM)', 'What is NSM. Full packet capture vs. metadata. Zeek (formerly Bro) overview. NetFlow and IPFIX. Protocol analysis. Identifying suspicious network activity. Beaconing detection.', 5, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch2_id AND title = 'Network Security Monitoring (NSM)'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch2_id, 'Endpoint Monitoring', 'Endpoint Detection and Response (EDR). Host-based Intrusion Detection (HIDS). Process monitoring. File integrity monitoring. Registry monitoring on Windows. Sysmon for Windows. Auditd for Linux.', 6, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch2_id AND title = 'Endpoint Monitoring'
    );

    -- ---- Chapter 3: Threat Detection (7 lessons) ----

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch3_id, 'Understanding Threat Intelligence', 'What is threat intelligence. Tactical vs. Strategic vs. Operational intelligence. Indicators of Compromise (IOCs) including IP addresses, domains, file hashes, and URLs. Threat feeds and sources. MITRE ATT&CK framework introduction. OSINT for defenders.', 1, true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch3_id AND title = 'Understanding Threat Intelligence'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch3_id, 'Common Attack Patterns', 'Reconnaissance indicators. Initial access methods including phishing, exploiting public-facing applications, and compromised credentials. Command and Control (C2) beaconing. Lateral movement. Data exfiltration patterns. Ransomware behaviors.', 2, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch3_id AND title = 'Common Attack Patterns'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch3_id, 'Detecting Malware', 'Signature-based detection. Heuristic detection. Behavioral analysis. Sandboxing. Antivirus vs. EDR. Common malware types including trojans, ransomware, spyware, rootkits, and fileless malware. VirusTotal and malware analysis sites.', 3, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch3_id AND title = 'Detecting Malware'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch3_id, 'Phishing Detection and Response', 'Identifying phishing emails. Email header analysis. SPF, DKIM, and DMARC. Malicious attachments. Suspicious links and credential harvesting pages. Responding to phishing incidents. User reporting mechanisms.', 4, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch3_id AND title = 'Phishing Detection and Response'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch3_id, 'Detecting Network Attacks', 'Port scanning detection. DDoS attack indicators. Man-in-the-Middle (MITM) attacks. DNS tunneling. Suspicious SMB activity. SQL injection attempts in logs. Brute force attack detection.', 5, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch3_id AND title = 'Detecting Network Attacks'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch3_id, 'User and Entity Behavior Analytics (UEBA)', 'What is UEBA. Establishing baseline behavior. Anomaly detection. Peer group analysis. Risk scoring. Common UEBA use cases including insider threats, compromised accounts, and privilege abuse.', 6, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch3_id AND title = 'User and Entity Behavior Analytics (UEBA)'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch3_id, 'Alert Triage and Investigation', 'The triage process. Determining true positive vs. false positive. Investigating alerts step-by-step. Enriching alerts with context. Escalation criteria. Documenting investigations. Case management tools.', 7, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch3_id AND title = 'Alert Triage and Investigation'
    );

    -- ---- Chapter 4: Incident Response Fundamentals (8 lessons) ----

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch4_id, 'Incident Response Process', 'Defining security incidents. Incident vs. Event vs. Alert. Incident severity classification. Incident response team roles including Incident Commander, Security Analyst, Forensics Specialist, and Communications Lead. IR plan components. Tabletop exercises.', 1, true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch4_id AND title = 'Incident Response Process'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch4_id, 'Detection and Analysis Phase', 'Recognizing incidents. Initial assessment. Scoping the incident. Identifying affected systems. Timeline construction. Indicator identification. Determining incident type including malware infection, data breach, unauthorized access, and DDoS.', 2, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch4_id AND title = 'Detection and Analysis Phase'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch4_id, 'Containment Strategies', 'Short-term and long-term containment. Containment decision factors. Network isolation. Disabling accounts. Blocking IOCs including IPs, domains, and hashes. Preserving evidence. Business impact considerations.', 3, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch4_id AND title = 'Containment Strategies'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch4_id, 'Eradication and Recovery', 'Removing threat actor access. Malware removal. Patching vulnerabilities. Rebuilding systems. Restoring from backups. Verification steps. Monitoring for reinfection. Returning to normal operations.', 4, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch4_id AND title = 'Eradication and Recovery'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch4_id, 'Evidence Collection and Preservation', 'Chain of custody. Volatile vs. non-volatile data. Order of volatility: RAM, network connections, running processes, disk, logs. Memory acquisition. Disk imaging. Log collection. Legal considerations.', 5, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch4_id AND title = 'Evidence Collection and Preservation'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch4_id, 'Communication During Incidents', 'Internal and external communication. Legal and compliance notifications. Media handling. Status updates. Documentation importance. Post-incident communication. Stakeholder management.', 6, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch4_id AND title = 'Communication During Incidents'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch4_id, 'Post-Incident Activities', 'Lessons learned meetings. Incident report writing. Identifying gaps. Updating procedures and playbooks. Security improvements. Training recommendations. Metrics and KPIs. Root cause analysis.', 7, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch4_id AND title = 'Post-Incident Activities'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch4_id, 'Introduction to Digital Forensics', 'Forensics in incident response. Forensic analysis process. File system analysis. Registry analysis on Windows. Log analysis. Memory forensics basics. Timeline analysis. Artifacts of interest including prefetch files, recent documents, browser history, and event logs.', 8, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch4_id AND title = 'Introduction to Digital Forensics'
    );

    -- ---- Chapter 5: Security Tools and Technologies (6 lessons) ----

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch5_id, 'Firewalls and Network Security', 'Firewall types including packet filter, stateful, and next-gen. Firewall rules and policies. Allow-list vs. deny-list. DMZ and network segmentation. Reading firewall logs. Common misconfigurations. Best practices.', 1, true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch5_id AND title = 'Firewalls and Network Security'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch5_id, 'Intrusion Detection and Prevention Systems', 'IDS vs. IPS. Signature-based vs. Anomaly-based detection. Network-based (NIDS/NIPS) vs. Host-based (HIDS/HIPS). Snort basics. Suricata overview. Tuning IDS/IPS rules. Managing false positives.', 2, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch5_id AND title = 'Intrusion Detection and Prevention Systems'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch5_id, 'Antivirus and Endpoint Protection', 'Traditional antivirus limitations. Endpoint Detection and Response (EDR). Next-gen antivirus. Behavioral analysis. Sandboxing. Quarantine and remediation. Common evasion techniques attackers use.', 3, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch5_id AND title = 'Antivirus and Endpoint Protection'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch5_id, 'Security Information and Event Management (SIEM) Deep Dive', 'Splunk advanced features. ELK Stack with Elasticsearch, Logstash, and Kibana. Creating complex searches and correlations. Threat hunting with SIEM. Use case development. Dashboard creation. Reporting and compliance.', 4, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch5_id AND title = 'Security Information and Event Management (SIEM) Deep Dive'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch5_id, 'Threat Intelligence Platforms', 'TIP overview. Integrating threat feeds. STIX and TAXII protocols. Automated IOC blocking. Threat intel sharing communities. MISP (Malware Information Sharing Platform). OpenCTI.', 5, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch5_id AND title = 'Threat Intelligence Platforms'
    );

    INSERT INTO public.sub_materials (material_id, title, content, order_index, is_preview)
    SELECT v_bt_ch5_id, 'Security Orchestration, Automation and Response (SOAR)', 'What is SOAR. Benefits of automation. Playbook creation. Common automation scenarios including alert enrichment, automated response actions, ticket creation, and IOC blocking. SOAR platforms overview. Building a simple playbook.', 6, false
    WHERE NOT EXISTS (
        SELECT 1 FROM public.sub_materials WHERE material_id = v_bt_ch5_id AND title = 'Security Orchestration, Automation and Response (SOAR)'
    );

    RAISE NOTICE 'Inserted/verified 32 sub_materials for Blue Team course';

    -- =====================================================
    -- 7. INSERT PLACEHOLDER COURSE MATERIALS
    -- =====================================================

    -- Placeholder material for Web Application Security Fundamentals
    INSERT INTO public.materials (course_id, title, description, order_index)
    SELECT c.id, 'Getting Started', 'Introduction to the course and overview of topics covered.', 1
    FROM public.courses c
    WHERE c.slug = 'web-app-security-fundamentals'
    AND NOT EXISTS (
        SELECT 1 FROM public.materials m WHERE m.course_id = c.id AND m.title = 'Getting Started'
    );

    -- Placeholder material for Network Security and Penetration Testing
    INSERT INTO public.materials (course_id, title, description, order_index)
    SELECT c.id, 'Getting Started', 'Introduction to the course and overview of topics covered.', 1
    FROM public.courses c
    WHERE c.slug = 'network-security-pentest'
    AND NOT EXISTS (
        SELECT 1 FROM public.materials m WHERE m.course_id = c.id AND m.title = 'Getting Started'
    );

    -- Placeholder material for Professional Penetration Testing
    INSERT INTO public.materials (course_id, title, description, order_index)
    SELECT c.id, 'Getting Started', 'Introduction to the course and overview of topics covered.', 1
    FROM public.courses c
    WHERE c.slug = 'professional-penetration-testing'
    AND NOT EXISTS (
        SELECT 1 FROM public.materials m WHERE m.course_id = c.id AND m.title = 'Getting Started'
    );

    -- Placeholder material for Applied Cryptography
    INSERT INTO public.materials (course_id, title, description, order_index)
    SELECT c.id, 'Getting Started', 'Introduction to the course and overview of topics covered.', 1
    FROM public.courses c
    WHERE c.slug = 'applied-cryptography'
    AND NOT EXISTS (
        SELECT 1 FROM public.materials m WHERE m.course_id = c.id AND m.title = 'Getting Started'
    );

    -- Placeholder material for Binary Exploitation and Exploit Development
    INSERT INTO public.materials (course_id, title, description, order_index)
    SELECT c.id, 'Getting Started', 'Introduction to the course and overview of topics covered.', 1
    FROM public.courses c
    WHERE c.slug = 'exploit-development'
    AND NOT EXISTS (
        SELECT 1 FROM public.materials m WHERE m.course_id = c.id AND m.title = 'Getting Started'
    );

    RAISE NOTICE 'Inserted/verified placeholder materials for 5 placeholder courses';

    -- =====================================================
    -- 8. INSERT QUESTS (QUIZZES)
    -- =====================================================

    -- Ethical Hacking Quests (5 quests, one per chapter)
    INSERT INTO public.quests (course_id, title, passing_score, time_limit, max_attempts)
    SELECT v_course_eth_hack_id, 'Chapter 1 Quiz: Intro to Cybersecurity & Ethical Hacking', 70, 15, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quests WHERE course_id = v_course_eth_hack_id AND title = 'Chapter 1 Quiz: Intro to Cybersecurity & Ethical Hacking'
    );

    INSERT INTO public.quests (course_id, title, passing_score, time_limit, max_attempts)
    SELECT v_course_eth_hack_id, 'Chapter 2 Quiz: Reconnaissance Fundamentals', 70, 20, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quests WHERE course_id = v_course_eth_hack_id AND title = 'Chapter 2 Quiz: Reconnaissance Fundamentals'
    );

    INSERT INTO public.quests (course_id, title, passing_score, time_limit, max_attempts)
    SELECT v_course_eth_hack_id, 'Chapter 3 Quiz: Scanning and Enumeration', 70, 25, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quests WHERE course_id = v_course_eth_hack_id AND title = 'Chapter 3 Quiz: Scanning and Enumeration'
    );

    INSERT INTO public.quests (course_id, title, passing_score, time_limit, max_attempts)
    SELECT v_course_eth_hack_id, 'Chapter 4 Quiz: Introduction to Exploitation', 75, 30, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quests WHERE course_id = v_course_eth_hack_id AND title = 'Chapter 4 Quiz: Introduction to Exploitation'
    );

    INSERT INTO public.quests (course_id, title, passing_score, time_limit, max_attempts)
    SELECT v_course_eth_hack_id, 'Chapter 5 Quiz: Post-Exploitation and Reporting', 70, 20, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quests WHERE course_id = v_course_eth_hack_id AND title = 'Chapter 5 Quiz: Post-Exploitation and Reporting'
    );

    -- Retrieve Ethical Hacking Chapter 1 quest ID for question insertion
    SELECT id INTO v_eth_quest_ch1_id FROM public.quests WHERE course_id = v_course_eth_hack_id AND title = 'Chapter 1 Quiz: Intro to Cybersecurity & Ethical Hacking';

    -- Blue Team Quests (5 quests, one per chapter)
    INSERT INTO public.quests (course_id, title, passing_score, time_limit, max_attempts)
    SELECT v_course_blue_team_id, 'Chapter 1 Quiz: Intro to Defensive Security', 70, 15, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quests WHERE course_id = v_course_blue_team_id AND title = 'Chapter 1 Quiz: Intro to Defensive Security'
    );

    INSERT INTO public.quests (course_id, title, passing_score, time_limit, max_attempts)
    SELECT v_course_blue_team_id, 'Chapter 2 Quiz: Security Monitoring Basics', 70, 20, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quests WHERE course_id = v_course_blue_team_id AND title = 'Chapter 2 Quiz: Security Monitoring Basics'
    );

    INSERT INTO public.quests (course_id, title, passing_score, time_limit, max_attempts)
    SELECT v_course_blue_team_id, 'Chapter 3 Quiz: Threat Detection', 70, 25, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quests WHERE course_id = v_course_blue_team_id AND title = 'Chapter 3 Quiz: Threat Detection'
    );

    INSERT INTO public.quests (course_id, title, passing_score, time_limit, max_attempts)
    SELECT v_course_blue_team_id, 'Chapter 4 Quiz: Incident Response Fundamentals', 75, 30, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quests WHERE course_id = v_course_blue_team_id AND title = 'Chapter 4 Quiz: Incident Response Fundamentals'
    );

    INSERT INTO public.quests (course_id, title, passing_score, time_limit, max_attempts)
    SELECT v_course_blue_team_id, 'Chapter 5 Quiz: Security Tools and Technologies', 70, 25, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quests WHERE course_id = v_course_blue_team_id AND title = 'Chapter 5 Quiz: Security Tools and Technologies'
    );

    -- Retrieve Blue Team Chapter 1 quest ID for question insertion
    SELECT id INTO v_bt_quest_ch1_id FROM public.quests WHERE course_id = v_course_blue_team_id AND title = 'Chapter 1 Quiz: Intro to Defensive Security';

    RAISE NOTICE 'Inserted/verified 10 quests (5 per main course)';

    -- =====================================================
    -- 9. INSERT QUEST QUESTIONS - ETHICAL HACKING CH1
    -- =====================================================

    -- Question 1 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_eth_quest_ch1_id, 'multiple_choice', 'What distinguishes a white hat hacker from a black hat hacker?', 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'What distinguishes a white hat hacker from a black hat hacker?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'What distinguishes a white hat hacker from a black hat hacker?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'White hat hackers work without authorization', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'White hat hackers work without authorization'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'White hat hackers have authorization and work within legal boundaries', true, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'White hat hackers have authorization and work within legal boundaries'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'White hat hackers only target government systems', false, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'White hat hackers only target government systems'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'There is no difference between them', false, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'There is no difference between them'
    );

    -- Question 2 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_eth_quest_ch1_id, 'multiple_choice', 'Which law in the US governs unauthorized access to computer systems?', 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'Which law in the US governs unauthorized access to computer systems?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'Which law in the US governs unauthorized access to computer systems?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Digital Millennium Copyright Act', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Digital Millennium Copyright Act'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Computer Fraud and Abuse Act (CFAA)', true, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Computer Fraud and Abuse Act (CFAA)'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Sarbanes-Oxley Act', false, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Sarbanes-Oxley Act'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Electronic Communications Privacy Act', false, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Electronic Communications Privacy Act'
    );

    -- Question 3 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_eth_quest_ch1_id, 'multiple_choice', 'What is the first phase of penetration testing?', 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'What is the first phase of penetration testing?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'What is the first phase of penetration testing?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Scanning', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Scanning'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Exploitation', false, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Exploitation'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Reconnaissance', true, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Reconnaissance'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Reporting', false, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Reporting'
    );

    -- Question 4 (true_false)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_eth_quest_ch1_id, 'true_false', 'It is acceptable to test a website for vulnerabilities without authorization if you discover a vulnerability.', 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'It is acceptable to test a website for vulnerabilities without authorization if you discover a vulnerability.'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'It is acceptable to test a website for vulnerabilities without authorization if you discover a vulnerability.';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'True', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'True'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'False', true, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'False'
    );

    -- Question 5 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_eth_quest_ch1_id, 'multiple_choice', 'What does OWASP stand for?', 5
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'What does OWASP stand for?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'What does OWASP stand for?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Open Web Application Security Project', true, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Open Web Application Security Project'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Online Web Application Safety Protocol', false, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Online Web Application Safety Protocol'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Open Wireless Application Security Platform', false, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Open Wireless Application Security Platform'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Organized Web Attack Security Program', false, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Organized Web Attack Security Program'
    );

    -- Question 6 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_eth_quest_ch1_id, 'multiple_choice', 'Which document defines the scope and boundaries of a penetration test?', 6
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'Which document defines the scope and boundaries of a penetration test?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'Which document defines the scope and boundaries of a penetration test?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Non-Disclosure Agreement', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Non-Disclosure Agreement'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Rules of Engagement', true, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Rules of Engagement'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Incident Response Plan', false, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Incident Response Plan'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Security Policy', false, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Security Policy'
    );

    -- Question 7 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_eth_quest_ch1_id, 'multiple_choice', 'What is the purpose of a Non-Disclosure Agreement (NDA) in security testing?', 7
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'What is the purpose of a Non-Disclosure Agreement (NDA) in security testing?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'What is the purpose of a Non-Disclosure Agreement (NDA) in security testing?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'To define the testing methodology', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'To define the testing methodology'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'To protect confidential information discovered during testing', true, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'To protect confidential information discovered during testing'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'To authorize the penetration test', false, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'To authorize the penetration test'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'To set the testing timeline', false, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'To set the testing timeline'
    );

    -- Question 8 (true_false)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_eth_quest_ch1_id, 'true_false', 'Script kiddies typically understand the underlying code of the tools they use.', 8
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'Script kiddies typically understand the underlying code of the tools they use.'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'Script kiddies typically understand the underlying code of the tools they use.';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'True', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'True'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'False', true, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'False'
    );

    -- Question 9 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_eth_quest_ch1_id, 'multiple_choice', 'What is the primary difference between a penetration test and a vulnerability assessment?', 9
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'What is the primary difference between a penetration test and a vulnerability assessment?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'What is the primary difference between a penetration test and a vulnerability assessment?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'A penetration test is automated while a vulnerability assessment is manual', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'A penetration test is automated while a vulnerability assessment is manual'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'A penetration test attempts to exploit vulnerabilities while a vulnerability assessment only identifies them', true, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'A penetration test attempts to exploit vulnerabilities while a vulnerability assessment only identifies them'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'A vulnerability assessment is more thorough than a penetration test', false, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'A vulnerability assessment is more thorough than a penetration test'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'There is no difference', false, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'There is no difference'
    );

    -- Question 10 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_eth_quest_ch1_id, 'multiple_choice', 'Which penetration testing methodology framework is maintained by PTES?', 10
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'Which penetration testing methodology framework is maintained by PTES?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_eth_quest_ch1_id AND question_text = 'Which penetration testing methodology framework is maintained by PTES?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'OWASP Testing Guide', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'OWASP Testing Guide'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'NIST Cybersecurity Framework', false, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'NIST Cybersecurity Framework'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Penetration Testing Execution Standard', true, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Penetration Testing Execution Standard'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'ISO 27001', false, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'ISO 27001'
    );

    RAISE NOTICE 'Inserted/verified 10 questions with options for Ethical Hacking Chapter 1 quiz';

    -- =====================================================
    -- 10. INSERT QUEST QUESTIONS - BLUE TEAM CH1
    -- =====================================================

    -- Question 1 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_bt_quest_ch1_id, 'multiple_choice', 'What is the primary role of a blue team in cybersecurity?', 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'What is the primary role of a blue team in cybersecurity?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'What is the primary role of a blue team in cybersecurity?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Attacking systems to find vulnerabilities', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Attacking systems to find vulnerabilities'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Defending systems and detecting threats', true, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Defending systems and detecting threats'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Developing software applications', false, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Developing software applications'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Managing network infrastructure', false, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Managing network infrastructure'
    );

    -- Question 2 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_bt_quest_ch1_id, 'multiple_choice', 'Which of the following is NOT a common threat actor category?', 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'Which of the following is NOT a common threat actor category?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'Which of the following is NOT a common threat actor category?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Advanced Persistent Threats (APTs)', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Advanced Persistent Threats (APTs)'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Hacktivists', false, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Hacktivists'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Script Kiddies', false, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Script Kiddies'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Quality Assurance Testers', true, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Quality Assurance Testers'
    );

    -- Question 3 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_bt_quest_ch1_id, 'multiple_choice', 'What does the CIA Triad stand for in cybersecurity?', 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'What does the CIA Triad stand for in cybersecurity?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'What does the CIA Triad stand for in cybersecurity?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Central Intelligence Agency', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Central Intelligence Agency'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Confidentiality, Integrity, Availability', true, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Confidentiality, Integrity, Availability'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Control, Inspect, Authenticate', false, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Control, Inspect, Authenticate'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Classify, Identify, Authorize', false, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Classify, Identify, Authorize'
    );

    -- Question 4 (true_false)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_bt_quest_ch1_id, 'true_false', 'The NIST Incident Response Framework consists of four phases.', 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'The NIST Incident Response Framework consists of four phases.'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'The NIST Incident Response Framework consists of four phases.';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'True', true, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'True'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'False', false, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'False'
    );

    -- Question 5 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_bt_quest_ch1_id, 'multiple_choice', 'Which phase of the NIST Incident Response Framework comes first?', 5
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'Which phase of the NIST Incident Response Framework comes first?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'Which phase of the NIST Incident Response Framework comes first?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Detection & Analysis', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Detection & Analysis'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Containment', false, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Containment'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Preparation', true, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Preparation'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Post-Incident Activity', false, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Post-Incident Activity'
    );

    -- Question 6 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_bt_quest_ch1_id, 'multiple_choice', 'What is a Security Operations Center (SOC)?', 6
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'What is a Security Operations Center (SOC)?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'What is a Security Operations Center (SOC)?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'A physical room where servers are stored', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'A physical room where servers are stored'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'A centralized team that monitors and responds to security events', true, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'A centralized team that monitors and responds to security events'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'A software tool for scanning vulnerabilities', false, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'A software tool for scanning vulnerabilities'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'A compliance certification program', false, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'A compliance certification program'
    );

    -- Question 7 (true_false)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_bt_quest_ch1_id, 'true_false', 'Defense-in-depth relies on a single strong security control to protect systems.', 7
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'Defense-in-depth relies on a single strong security control to protect systems.'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'Defense-in-depth relies on a single strong security control to protect systems.';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'True', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'True'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'False', true, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'False'
    );

    -- Question 8 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_bt_quest_ch1_id, 'multiple_choice', 'Which type of security control is designed to identify threats after they occur?', 8
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'Which type of security control is designed to identify threats after they occur?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'Which type of security control is designed to identify threats after they occur?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Preventive controls', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Preventive controls'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Detective controls', true, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Detective controls'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Corrective controls', false, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Corrective controls'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Administrative controls', false, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Administrative controls'
    );

    -- Question 9 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_bt_quest_ch1_id, 'multiple_choice', 'What does SIEM stand for?', 9
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'What does SIEM stand for?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'What does SIEM stand for?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Security Information and Event Management', true, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Security Information and Event Management'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'System Integration and Enterprise Monitoring', false, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'System Integration and Enterprise Monitoring'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Secure Internet and Email Management', false, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Secure Internet and Email Management'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Standard Incident and Event Methodology', false, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Standard Incident and Event Methodology'
    );

    -- Question 10 (multiple_choice)
    INSERT INTO public.quest_questions (quest_id, question_type, question_text, order_index)
    SELECT v_bt_quest_ch1_id, 'multiple_choice', 'Which tool category provides real-time monitoring of endpoint activities and threat detection?', 10
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'Which tool category provides real-time monitoring of endpoint activities and threat detection?'
    );
    SELECT id INTO v_question_id FROM public.quest_questions WHERE quest_id = v_bt_quest_ch1_id AND question_text = 'Which tool category provides real-time monitoring of endpoint activities and threat detection?';

    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Firewall', false, 1
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Firewall'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Endpoint Detection and Response (EDR)', true, 2
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Endpoint Detection and Response (EDR)'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'VPN', false, 3
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'VPN'
    );
    INSERT INTO public.quest_options (question_id, option_text, is_correct, order_index)
    SELECT v_question_id, 'Load Balancer', false, 4
    WHERE NOT EXISTS (
        SELECT 1 FROM public.quest_options WHERE question_id = v_question_id AND option_text = 'Load Balancer'
    );

    RAISE NOTICE 'Inserted/verified 10 questions with options for Blue Team Chapter 1 quiz';

    -- =====================================================
    -- 11. INSERT COURSE_SKILLS ASSOCIATIONS
    -- =====================================================

    -- Ethical Hacking Skills
    INSERT INTO public.course_skills (course_id, skill_id, proficiency_level_taught)
    SELECT v_course_eth_hack_id, s.id, 'beginner'
    FROM public.skills s
    WHERE s.name = 'Network Scanning'
    ON CONFLICT (course_id, skill_id) DO NOTHING;

    INSERT INTO public.course_skills (course_id, skill_id, proficiency_level_taught)
    SELECT v_course_eth_hack_id, s.id, 'beginner'
    FROM public.skills s
    WHERE s.name = 'OWASP Top 10 Mastery'
    ON CONFLICT (course_id, skill_id) DO NOTHING;

    INSERT INTO public.course_skills (course_id, skill_id, proficiency_level_taught)
    SELECT v_course_eth_hack_id, s.id, 'beginner'
    FROM public.skills s
    WHERE s.name = 'SQL Injection'
    ON CONFLICT (course_id, skill_id) DO NOTHING;

    INSERT INTO public.course_skills (course_id, skill_id, proficiency_level_taught)
    SELECT v_course_eth_hack_id, s.id, 'beginner'
    FROM public.skills s
    WHERE s.name = 'Cross-Site Scripting (XSS)'
    ON CONFLICT (course_id, skill_id) DO NOTHING;

    RAISE NOTICE 'Inserted/verified course_skills for Ethical Hacking (4 skills)';

    -- Blue Team Skills
    INSERT INTO public.course_skills (course_id, skill_id, proficiency_level_taught)
    SELECT v_course_blue_team_id, s.id, 'beginner'
    FROM public.skills s
    WHERE s.name = 'Network Sniffing'
    ON CONFLICT (course_id, skill_id) DO NOTHING;

    INSERT INTO public.course_skills (course_id, skill_id, proficiency_level_taught)
    SELECT v_course_blue_team_id, s.id, 'beginner'
    FROM public.skills s
    WHERE s.name = 'Disk Forensics'
    ON CONFLICT (course_id, skill_id) DO NOTHING;

    INSERT INTO public.course_skills (course_id, skill_id, proficiency_level_taught)
    SELECT v_course_blue_team_id, s.id, 'beginner'
    FROM public.skills s
    WHERE s.name = 'Memory Forensics'
    ON CONFLICT (course_id, skill_id) DO NOTHING;

    RAISE NOTICE 'Inserted/verified course_skills for Blue Team (3 skills)';

    -- =====================================================
    -- 12. SUCCESS SUMMARY
    -- =====================================================

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Course content seeding completed successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - 7 courses (2 main + 5 placeholder)';
    RAISE NOTICE '  - 15 materials (5 + 5 + 5 placeholder)';
    RAISE NOTICE '  - 63 lessons (31 + 32)';
    RAISE NOTICE '  - 10 quests (5 per main course)';
    RAISE NOTICE '  - 20 questions (10 per main course, Chapter 1 only)';
    RAISE NOTICE '  - 7 course_skills associations (4 + 3)';
    RAISE NOTICE '========================================';

END $$;