-- =====================================================
-- LINK SECURITY TOOLS TO COURSES
-- =====================================================
-- Run this after seeding both tools and courses
-- This associates security tools with relevant courses

DO $$
DECLARE
    v_web_app_sec_id UUID;
    v_network_sec_id UUID;
    v_pentest_id UUID;
    v_crypto_id UUID;
    v_exploit_dev_id UUID;
    v_eth_hack_id UUID;
    v_blue_team_id UUID;
BEGIN
    -- Get course IDs by slug
    SELECT id INTO v_web_app_sec_id FROM public.courses WHERE slug = 'web-app-security-fundamentals';
    SELECT id INTO v_network_sec_id FROM public.courses WHERE slug = 'network-security-pentest';
    SELECT id INTO v_pentest_id FROM public.courses WHERE slug = 'professional-penetration-testing';
    SELECT id INTO v_crypto_id FROM public.courses WHERE slug = 'applied-cryptography';
    SELECT id INTO v_exploit_dev_id FROM public.courses WHERE slug = 'exploit-development';
    SELECT id INTO v_eth_hack_id FROM public.courses WHERE slug = 'intro-ethical-hacking';
    SELECT id INTO v_blue_team_id FROM public.courses WHERE slug = 'intro-blue-team-operations';

    -- Verify courses exist
    IF v_web_app_sec_id IS NULL THEN
        RAISE EXCEPTION 'Web Application Security course not found!';
    END IF;

    -- =====================================================
    -- WEB APPLICATION SECURITY TOOLS
    -- =====================================================

    -- Burp Suite - Essential for web app testing
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_web_app_sec_id, v_pentest_id]
    WHERE name = 'Burp Suite Professional';

    -- OWASP ZAP - Web app scanner
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_web_app_sec_id, v_pentest_id]
    WHERE name = 'OWASP ZAP';

    -- Nikto - Web server scanner
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_web_app_sec_id]
    WHERE name = 'Nikto';

    -- Acunetix - Web vulnerability scanner
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_web_app_sec_id]
    WHERE name = 'Acunetix';

    -- Nuclei - Fast vulnerability scanner
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_web_app_sec_id, v_pentest_id]
    WHERE name = 'Nuclei';

    -- =====================================================
    -- EXPLOITATION TOOLS
    -- =====================================================

    -- Metasploit - Core pentesting tool
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_pentest_id, v_network_sec_id, v_exploit_dev_id]
    WHERE name = 'Metasploit Framework';

    -- SQLmap - SQL injection tool
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_web_app_sec_id, v_pentest_id]
    WHERE name = 'SQLmap';

    -- Commix - Command injection tool
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_web_app_sec_id, v_pentest_id]
    WHERE name = 'Commix';

    -- BeEF - Browser exploitation
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_web_app_sec_id, v_pentest_id]
    WHERE name = 'BeEF';

    -- Empire - Post-exploitation framework
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_pentest_id]
    WHERE name = 'Empire';

    -- =====================================================
    -- NETWORK RECONNAISSANCE TOOLS
    -- =====================================================

    -- Nmap - Essential network scanner
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_network_sec_id, v_pentest_id]
    WHERE name = 'Nmap';

    -- Masscan - High-speed port scanner
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_network_sec_id, v_pentest_id]
    WHERE name = 'Masscan';

    -- Netcat - Network utility
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_network_sec_id, v_pentest_id]
    WHERE name = 'Netcat';

    -- Amass - Asset discovery
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_network_sec_id, v_pentest_id]
    WHERE name = 'Amass';

    -- Shodan CLI - Internet device search
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_network_sec_id, v_pentest_id]
    WHERE name = 'Shodan CLI';

    -- Recon-ng - Reconnaissance framework
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_network_sec_id, v_pentest_id]
    WHERE name = 'Recon-ng';

    -- =====================================================
    -- FORENSICS & TRAFFIC ANALYSIS TOOLS
    -- =====================================================

    -- Wireshark - Network protocol analyzer
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_network_sec_id, v_pentest_id]
    WHERE name = 'Wireshark';

    -- tcpdump - Packet analyzer
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_network_sec_id]
    WHERE name = 'tcpdump';

    -- Volatility - Memory forensics
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_pentest_id, v_exploit_dev_id]
    WHERE name = 'Volatility';

    -- Autopsy - Digital forensics
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_pentest_id]
    WHERE name = 'Autopsy';

    -- Sleuth Kit - Forensic analysis
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_pentest_id]
    WHERE name = 'Sleuth Kit';

    -- =====================================================
    -- CRYPTOGRAPHY & PASSWORD CRACKING TOOLS
    -- =====================================================

    -- Hashcat - Password recovery
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_crypto_id, v_pentest_id]
    WHERE name = 'Hashcat';

    -- John the Ripper - Password cracking
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_crypto_id, v_pentest_id]
    WHERE name = 'John the Ripper';

    -- Hydra - Network login cracker
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_crypto_id, v_pentest_id]
    WHERE name = 'Hydra';

    -- CeWL - Wordlist generator
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_crypto_id, v_pentest_id]
    WHERE name = 'CeWL';

    -- Crunch - Wordlist generator
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_crypto_id]
    WHERE name = 'Crunch';

    -- =====================================================
    -- WIRELESS SECURITY TOOLS
    -- =====================================================

    -- Aircrack-ng - Wireless auditing suite
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_network_sec_id]
    WHERE name = 'Aircrack-ng';

    -- Wifite - Automated wireless attack tool
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_network_sec_id]
    WHERE name = 'Wifite';

    -- Kismet - Wireless network detector
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_network_sec_id]
    WHERE name = 'Kismet';

    -- Bettercap - Network attack and monitoring
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_network_sec_id, v_pentest_id]
    WHERE name = 'Bettercap';

    -- =====================================================
    -- BINARY ANALYSIS & REVERSE ENGINEERING TOOLS
    -- =====================================================

    -- GDB/GEF - Debugger for exploit development
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_exploit_dev_id]
    WHERE name LIKE '%GDB%' OR name LIKE '%GEF%';

    -- Radare2 - Reverse engineering framework
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_exploit_dev_id]
    WHERE name = 'Radare2';

    -- Ghidra - Reverse engineering tool
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_exploit_dev_id]
    WHERE name = 'Ghidra';

    -- IDA Pro - Disassembler and debugger
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_exploit_dev_id]
    WHERE name = 'IDA Pro';

    -- pwntools - Exploit development library
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_exploit_dev_id]
    WHERE name = 'pwntools';

    -- ROPgadget - ROP chain tool
    UPDATE public.security_tools
    SET related_course_ids = ARRAY[v_exploit_dev_id]
    WHERE name = 'ROPgadget';

    -- =====================================================
    -- ETHICAL HACKING COURSE TOOLS
    -- =====================================================

    -- Nmap - also relevant to ethical hacking
    UPDATE public.security_tools
    SET related_course_ids = array_cat(related_course_ids, ARRAY[v_eth_hack_id])
    WHERE name = 'Nmap'
    AND (related_course_ids IS NULL OR NOT (v_eth_hack_id = ANY(related_course_ids)));

    -- Metasploit - also relevant to ethical hacking
    UPDATE public.security_tools
    SET related_course_ids = array_cat(related_course_ids, ARRAY[v_eth_hack_id])
    WHERE name = 'Metasploit Framework'
    AND (related_course_ids IS NULL OR NOT (v_eth_hack_id = ANY(related_course_ids)));

    -- Burp Suite - also relevant to ethical hacking
    UPDATE public.security_tools
    SET related_course_ids = array_cat(related_course_ids, ARRAY[v_eth_hack_id])
    WHERE name = 'Burp Suite Professional'
    AND (related_course_ids IS NULL OR NOT (v_eth_hack_id = ANY(related_course_ids)));

    -- Nikto - also relevant to ethical hacking
    UPDATE public.security_tools
    SET related_course_ids = array_cat(related_course_ids, ARRAY[v_eth_hack_id])
    WHERE name = 'Nikto'
    AND (related_course_ids IS NULL OR NOT (v_eth_hack_id = ANY(related_course_ids)));

    -- =====================================================
    -- BLUE TEAM COURSE TOOLS
    -- =====================================================

    -- Wireshark - also relevant to blue team
    UPDATE public.security_tools
    SET related_course_ids = array_cat(related_course_ids, ARRAY[v_blue_team_id])
    WHERE name = 'Wireshark'
    AND (related_course_ids IS NULL OR NOT (v_blue_team_id = ANY(related_course_ids)));

    -- tcpdump - also relevant to blue team
    UPDATE public.security_tools
    SET related_course_ids = array_cat(related_course_ids, ARRAY[v_blue_team_id])
    WHERE name = 'tcpdump'
    AND (related_course_ids IS NULL OR NOT (v_blue_team_id = ANY(related_course_ids)));

    -- Volatility - also relevant to blue team
    UPDATE public.security_tools
    SET related_course_ids = array_cat(related_course_ids, ARRAY[v_blue_team_id])
    WHERE name = 'Volatility'
    AND (related_course_ids IS NULL OR NOT (v_blue_team_id = ANY(related_course_ids)));

    -- Autopsy - also relevant to blue team
    UPDATE public.security_tools
    SET related_course_ids = array_cat(related_course_ids, ARRAY[v_blue_team_id])
    WHERE name = 'Autopsy'
    AND (related_course_ids IS NULL OR NOT (v_blue_team_id = ANY(related_course_ids)));

    -- =====================================================
    -- SUCCESS MESSAGE
    -- =====================================================

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Successfully linked security tools to courses!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Courses:';
    RAISE NOTICE '  - Web Application Security: %', v_web_app_sec_id;
    RAISE NOTICE '  - Network Security: %', v_network_sec_id;
    RAISE NOTICE '  - Penetration Testing: %', v_pentest_id;
    RAISE NOTICE '  - Cryptography: %', v_crypto_id;
    RAISE NOTICE '  - Exploit Development: %', v_exploit_dev_id;
    RAISE NOTICE '  - Ethical Hacking: %', v_eth_hack_id;
    RAISE NOTICE '  - Blue Team Operations: %', v_blue_team_id;
    RAISE NOTICE '========================================';

END $$;
