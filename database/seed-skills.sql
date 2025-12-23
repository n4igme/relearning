-- =====================================================
-- CYBERSECURITY SKILLS SEED DATA
-- =====================================================
-- Run this after creating the main schema
-- This seeds 25 essential cybersecurity skills across 6 categories

-- Web Application Security Skills
INSERT INTO public.skills (name, description, category) VALUES
('SQL Injection', 'Ability to identify and exploit SQL injection vulnerabilities in web applications', 'web'),
('Cross-Site Scripting (XSS)', 'Understanding of XSS attacks including reflected, stored, and DOM-based variants', 'web'),
('Cross-Site Request Forgery (CSRF)', 'Knowledge of CSRF attacks and bypass techniques', 'web'),
('Authentication Bypass', 'Skills in identifying and exploiting authentication and authorization flaws', 'web'),
('Server-Side Request Forgery (SSRF)', 'Ability to identify and exploit SSRF vulnerabilities', 'web'),
('File Upload Exploitation', 'Techniques for bypassing file upload restrictions and achieving code execution', 'web'),
('API Security Testing', 'REST/GraphQL API security testing and exploitation', 'web'),
('OWASP Top 10 Mastery', 'Comprehensive understanding of OWASP Top 10 vulnerabilities', 'web');

-- Network Security Skills
INSERT INTO public.skills (name, description, category) VALUES
('Network Scanning', 'Proficiency with Nmap and network reconnaissance tools', 'network'),
('Man-in-the-Middle Attacks', 'Understanding of MITM techniques and SSL/TLS attacks', 'network'),
('Network Sniffing', 'Packet capture and analysis using Wireshark and tcpdump', 'network'),
('Firewall Evasion', 'Techniques for bypassing firewalls and IDS/IPS systems', 'network'),
('VPN Security Analysis', 'Testing VPN configurations and protocols for vulnerabilities', 'network'),
('DNS Attacks', 'DNS spoofing, cache poisoning, and tunneling techniques', 'network');

-- Cryptography Skills
INSERT INTO public.skills (name, description, category) VALUES
('Encryption Algorithms', 'Understanding of AES, RSA, and common encryption schemes', 'cryptography'),
('Hash Function Analysis', 'Knowledge of MD5, SHA families, and hash collision attacks', 'cryptography'),
('Public Key Infrastructure', 'Understanding of PKI, certificates, and SSL/TLS', 'cryptography'),
('Password Cracking', 'Techniques for cracking hashes using Hashcat and John the Ripper', 'cryptography');

-- Social Engineering Skills
INSERT INTO public.skills (name, description, category) VALUES
('Phishing Campaign Design', 'Creating convincing phishing emails and landing pages', 'social_engineering'),
('Pretexting', 'Social engineering through impersonation and manipulation', 'social_engineering'),
('Physical Security Testing', 'Lockpicking, tailgating, and physical penetration testing', 'social_engineering');

-- Reverse Engineering Skills
INSERT INTO public.skills (name, description, category) VALUES
('Assembly Language', 'Reading and understanding x86/x64 assembly code', 'reverse_engineering'),
('Binary Analysis', 'Static and dynamic analysis of compiled binaries', 'reverse_engineering'),
('Malware Analysis', 'Techniques for analyzing and reverse engineering malware', 'reverse_engineering');

-- Forensics Skills
INSERT INTO public.skills (name, description, category) VALUES
('Disk Forensics', 'File recovery, timeline analysis, and disk imaging', 'forensics'),
('Memory Forensics', 'RAM analysis and volatile data extraction', 'forensics');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Successfully seeded 25 cybersecurity skills!';
    RAISE NOTICE 'Categories: Web (8), Network (6), Cryptography (4), Social Engineering (3), Reverse Engineering (3), Forensics (2)';
END $$;
