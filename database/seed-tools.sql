-- =====================================================
-- SECURITY TOOLS SEED DATA
-- =====================================================
-- Run this after creating the main schema
-- This seeds 35 essential security tools across 6 categories

-- Web Application Scanners
INSERT INTO public.security_tools (name, category, description, documentation_url, difficulty_level) VALUES
('Burp Suite Professional', 'scanner', 'Industry-standard web application security testing tool with advanced scanning capabilities', 'https://portswigger.net/burp/documentation', 'intermediate'),
('OWASP ZAP', 'scanner', 'Open-source web application security scanner with automated and manual testing features', 'https://www.zaproxy.org/docs/', 'beginner'),
('Nikto', 'scanner', 'Web server vulnerability scanner that checks for dangerous files, outdated versions, and misconfigurations', 'https://github.com/sullo/nikto/wiki', 'beginner'),
('Acunetix', 'scanner', 'Automated web vulnerability scanner for SQL injection, XSS, and other OWASP Top 10 vulnerabilities', 'https://www.acunetix.com/support/', 'intermediate'),
('Nuclei', 'scanner', 'Fast and customizable vulnerability scanner based on simple YAML templates', 'https://nuclei.projectdiscovery.io/', 'intermediate');

-- Exploitation Frameworks
INSERT INTO public.security_tools (name, category, description, documentation_url, difficulty_level) VALUES
('Metasploit Framework', 'exploitation', 'World''s most used penetration testing framework with extensive exploit database', 'https://docs.metasploit.com/', 'advanced'),
('SQLmap', 'exploitation', 'Automated SQL injection exploitation tool supporting multiple database engines', 'https://github.com/sqlmapproject/sqlmap/wiki', 'intermediate'),
('Commix', 'exploitation', 'Automated command injection exploitation tool', 'https://github.com/commixproject/commix/wiki', 'intermediate'),
('BeEF', 'exploitation', 'Browser Exploitation Framework for client-side attack vectors', 'https://github.com/beefproject/beef/wiki', 'advanced'),
('Empire', 'exploitation', 'Post-exploitation framework with PowerShell and Python agents', 'https://bc-security.gitbook.io/empire-wiki/', 'advanced');

-- Network Reconnaissance
INSERT INTO public.security_tools (name, category, description, documentation_url, difficulty_level) VALUES
('Nmap', 'reconnaissance', 'Network discovery and security auditing scanner with scripting capabilities', 'https://nmap.org/docs.html', 'beginner'),
('Masscan', 'reconnaissance', 'High-speed port scanner capable of scanning the entire Internet', 'https://github.com/robertdavidgraham/masscan', 'intermediate'),
('Netcat', 'reconnaissance', 'Networking utility for reading/writing data across network connections', 'https://nc110.sourceforge.io/', 'beginner'),
('Amass', 'reconnaissance', 'In-depth attack surface mapping and asset discovery tool', 'https://github.com/owasp-amass/amass/blob/master/doc/user_guide.md', 'intermediate'),
('Shodan CLI', 'reconnaissance', 'Search engine for Internet-connected devices and services', 'https://help.shodan.io/command-line-interface/0-installation', 'beginner'),
('Recon-ng', 'reconnaissance', 'Full-featured reconnaissance framework with modular structure', 'https://github.com/lanmaster53/recon-ng/wiki', 'intermediate');

-- Forensics & Traffic Analysis
INSERT INTO public.security_tools (name, category, description, documentation_url, difficulty_level) VALUES
('Wireshark', 'forensics', 'World''s foremost network protocol analyzer with deep packet inspection', 'https://www.wireshark.org/docs/', 'intermediate'),
('tcpdump', 'forensics', 'Command-line packet analyzer for network traffic capture', 'https://www.tcpdump.org/manpages/tcpdump.1.html', 'beginner'),
('Volatility', 'forensics', 'Advanced memory forensics framework for extracting digital artifacts from RAM', 'https://volatility3.readthedocs.io/', 'advanced'),
('Autopsy', 'forensics', 'Digital forensics platform for disk image analysis and file recovery', 'https://www.autopsy.com/support/', 'intermediate'),
('Sleuth Kit', 'forensics', 'Collection of command-line tools for forensic analysis of file systems', 'https://wiki.sleuthkit.org/', 'intermediate');

-- Cryptography & Password Cracking
INSERT INTO public.security_tools (name, category, description, documentation_url, difficulty_level) VALUES
('Hashcat', 'cryptography', 'World''s fastest password recovery tool supporting 300+ hash algorithms', 'https://hashcat.net/wiki/', 'intermediate'),
('John the Ripper', 'cryptography', 'Password cracking tool with support for various encryption algorithms', 'https://www.openwall.com/john/doc/', 'beginner'),
('Hydra', 'cryptography', 'Network login cracker supporting numerous protocols (SSH, FTP, HTTP, etc.)', 'https://github.com/vanhauser-thc/thc-hydra', 'beginner'),
('CeWL', 'cryptography', 'Custom wordlist generator from website content for targeted password attacks', 'https://github.com/digininja/CeWL', 'beginner'),
('Crunch', 'cryptography', 'Wordlist generator for creating custom character-based password lists', 'https://sourceforge.net/projects/crunch-wordlist/', 'beginner');

-- Wireless Security
INSERT INTO public.security_tools (name, category, description, documentation_url, difficulty_level) VALUES
('Aircrack-ng', 'wireless', 'Complete suite for auditing wireless networks (WEP/WPA/WPA2 cracking)', 'https://www.aircrack-ng.org/documentation.html', 'intermediate'),
('Kismet', 'wireless', 'Wireless network detector, sniffer, and intrusion detection system', 'https://www.kismetwireless.net/docs/', 'intermediate'),
('Wifite', 'wireless', 'Automated wireless attack tool for auditing WEP/WPA/WPS networks', 'https://github.com/derv82/wifite2/wiki', 'beginner'),
('Bettercap', 'wireless', 'Swiss army knife for WiFi, Bluetooth, and network attacks with real-time monitoring', 'https://www.bettercap.org/usage/', 'advanced');

-- Miscellaneous Security Tools
INSERT INTO public.security_tools (name, category, description, documentation_url, difficulty_level) VALUES
('Gobuster', 'reconnaissance', 'Directory/file brute-forcing tool for web path discovery', 'https://github.com/OJ/gobuster', 'beginner'),
('Dirb', 'reconnaissance', 'Web content scanner looking for hidden directories and files', 'https://tools.kali.org/web-applications/dirb', 'beginner'),
('Ffuf', 'reconnaissance', 'Fast web fuzzer for discovering hidden content and parameters', 'https://github.com/ffuf/ffuf', 'beginner'),
('Responder', 'exploitation', 'LLMNR, NBT-NS and MDNS poisoner for credential capture', 'https://github.com/lgandx/Responder', 'intermediate'),
('Mimikatz', 'exploitation', 'Post-exploitation tool for extracting plaintext passwords, hashes, and Kerberos tickets', 'https://github.com/gentilkiwi/mimikatz/wiki', 'advanced');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Successfully seeded 35 security tools!';
    RAISE NOTICE 'Categories: Scanner (5), Exploitation (5), Reconnaissance (6), Forensics (5), Cryptography (5), Wireless (4), Miscellaneous (5)';
    RAISE NOTICE 'Difficulty levels: Beginner (13), Intermediate (15), Advanced (7)';
END $$;
