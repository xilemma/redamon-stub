// Stub attack-surface graph data mimicking a Redamon Neo4j knowledge graph
// Synthetic but authentic-looking engagement against "acme-corp.com"

export type NodeType = "target" | "host" | "service" | "vulnerability" | "credential";

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  detail?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export const stubGraphData: GraphData = {
  nodes: [
    // ── Targets ────────────────────────────────────────────────────────────
    { id: "t1",  label: "acme-corp.com",              type: "target",        detail: "Primary target — e-commerce platform" },
    { id: "t2",  label: "api.acme-corp.com",          type: "target",        detail: "REST API subdomain" },
    { id: "t3",  label: "mail.acme-corp.com",         type: "target",        detail: "Corporate mail server" },
    { id: "t4",  label: "vpn.acme-corp.com",          type: "target",        detail: "OpenVPN gateway" },
    { id: "t5",  label: "jenkins.acme-corp.com",      type: "target",        detail: "CI/CD server — internet-exposed" },
    { id: "t6",  label: "staging.acme-corp.com",      type: "target",        detail: "Staging environment, no WAF" },
    { id: "t7",  label: "dev.acme-corp.com",          type: "target",        detail: "Developer portal — misconfigured" },

    // ── Hosts ───────────────────────────────────────────────────────────────
    { id: "h1",  label: "203.0.113.10",               type: "host",          detail: "Nginx 1.24 reverse proxy — Ubuntu 22.04" },
    { id: "h2",  label: "203.0.113.11",               type: "host",          detail: "Spring Boot 2.7 API server — JDK 11" },
    { id: "h3",  label: "203.0.113.12",               type: "host",          detail: "Postfix 3.7 / Dovecot 2.3 — Debian 11" },
    { id: "h4",  label: "203.0.113.20",               type: "host",          detail: "Jenkins 2.401.1 — CentOS 7" },
    { id: "h5",  label: "203.0.113.21",               type: "host",          detail: "Tomcat 9.0.70 staging — Ubuntu 20.04" },
    { id: "h6",  label: "10.10.0.5",                  type: "host",          detail: "Internal dev VM — reachable via VPN pivot" },
    { id: "h7",  label: "10.10.0.10",                 type: "host",          detail: "PostgreSQL 14.4 primary DB — RHEL 8" },
    { id: "h8",  label: "10.10.0.11",                 type: "host",          detail: "Redis 6.2.6 cache — no auth, internal" },
    { id: "h9",  label: "10.10.0.20",                 type: "host",          detail: "Elasticsearch 7.17 — internal cluster node" },
    { id: "h10", label: "10.10.0.30",                 type: "host",          detail: "Windows Server 2019 — AD domain controller" },
    { id: "h11", label: "10.10.0.31",                 type: "host",          detail: "Windows Server 2019 — file share server" },
    { id: "h12", label: "203.0.113.13",               type: "host",          detail: "OpenVPN 2.5.1 gateway — Ubuntu 20.04" },

    // ── Services ────────────────────────────────────────────────────────────
    { id: "s1",  label: "HTTPS/443",                  type: "service",       detail: "Nginx 1.24, TLS 1.3, valid cert (Let's Encrypt)" },
    { id: "s2",  label: "HTTP/80",                    type: "service",       detail: "Redirects to HTTPS — X-Forwarded-For exposed" },
    { id: "s3",  label: "SSH/22",                     type: "service",       detail: "OpenSSH 8.2p1 — password auth enabled" },
    { id: "s4",  label: "HTTPS/8443",                 type: "service",       detail: "Spring Boot actuator — /actuator/env exposed" },
    { id: "s5",  label: "SMTP/25",                    type: "service",       detail: "Postfix 3.7 — open relay misconfiguration" },
    { id: "s6",  label: "IMAPS/993",                  type: "service",       detail: "Dovecot 2.3 — TLS 1.2 only" },
    { id: "s7",  label: "HTTP/8080",                  type: "service",       detail: "Jenkins 2.401.1 — unauthenticated script console" },
    { id: "s8",  label: "HTTP/8888",                  type: "service",       detail: "Tomcat manager — default credentials" },
    { id: "s9",  label: "OpenVPN/1194",               type: "service",       detail: "OpenVPN 2.5.1 — UDP, weak cipher (BF-CBC)" },
    { id: "s10", label: "PostgreSQL/5432",            type: "service",       detail: "PostgreSQL 14.4 — pg_hba.conf allows 0.0.0.0/0" },
    { id: "s11", label: "Redis/6379",                 type: "service",       detail: "Redis 6.2.6 — no password, bound to 0.0.0.0" },
    { id: "s12", label: "Elasticsearch/9200",         type: "service",       detail: "Elasticsearch 7.17 — no auth, X-Pack disabled" },
    { id: "s13", label: "SMB/445",                    type: "service",       detail: "Windows SMB — signing disabled" },
    { id: "s14", label: "RDP/3389",                   type: "service",       detail: "Windows RDP — NLA disabled on file server" },
    { id: "s15", label: "SSH/22 (dev)",               type: "service",       detail: "OpenSSH 7.4 — outdated, weak ciphers" },
    { id: "s16", label: "HTTP/3000",                  type: "service",       detail: "Node.js dev server — debug mode, stack traces" },

    // ── Vulnerabilities ─────────────────────────────────────────────────────
    { id: "v1",  label: "CVE-2021-44228",             type: "vulnerability", detail: "Log4Shell — RCE via JNDI injection, CVSS 10.0 · Spring Boot logs user-agent" },
    { id: "v2",  label: "CVE-2022-22965",             type: "vulnerability", detail: "Spring4Shell — RCE via data binding, CVSS 9.8 · Spring Boot < 2.6.10" },
    { id: "v3",  label: "CVE-2023-27898",             type: "vulnerability", detail: "Jenkins CSRF/RCE via plugin update center, CVSS 8.8" },
    { id: "v4",  label: "CVE-2021-41773",             type: "vulnerability", detail: "Apache path traversal & RCE, CVSS 9.8 — staging Apache 2.4.49" },
    { id: "v5",  label: "CVE-2023-38408",             type: "vulnerability", detail: "OpenSSH ssh-agent RCE, CVSS 9.8 — affects OpenSSH < 9.3p2" },
    { id: "v6",  label: "CVE-2021-3156",              type: "vulnerability", detail: "sudo Baron Samedit heap overflow → root, CVSS 7.8" },
    { id: "v7",  label: "CVE-2022-0778",              type: "vulnerability", detail: "OpenSSL infinite loop in BN_mod_sqrt(), CVSS 7.5 — DoS" },
    { id: "v8",  label: "Redis no-auth RCE",          type: "vulnerability", detail: "Redis 6.2 bound without requirepass — slave replication abuse → RCE" },
    { id: "v9",  label: "Elasticsearch open index",   type: "vulnerability", detail: "customer_pii index publicly readable — 1.2 M records exposed" },
    { id: "v10", label: "SMB signing disabled",       type: "vulnerability", detail: "Relay attack possible (NTLM relay → AD compromise)" },
    { id: "v11", label: "CVE-2019-0708 (BlueKeep)",   type: "vulnerability", detail: "RDP wormable RCE on file server, CVSS 9.8 — NLA not enforced" },
    { id: "v12", label: "Actuator env disclosure",    type: "vulnerability", detail: "/actuator/env leaks DB passwords, AWS keys in Spring env vars" },
    { id: "v13", label: "Open SMTP relay",            type: "vulnerability", detail: "Postfix accepts RCPT TO for external domains — spam/phishing abuse" },
    { id: "v14", label: "Weak VPN cipher (BF-CBC)",   type: "vulnerability", detail: "SWEET32 birthday attack — 64-bit block cipher, CVSS 5.3" },
    { id: "v15", label: "Git repo exposed",           type: "vulnerability", detail: "/.git/ reachable on dev.acme-corp.com — full source + secrets in history" },

    // ── Credentials ─────────────────────────────────────────────────────────
    { id: "c1",  label: "admin:Acme2023!",            type: "credential",    detail: "Jenkins admin — Hydra dictionary attack (rockyou.txt)" },
    { id: "c2",  label: "tomcat:s3cr3t",              type: "credential",    detail: "Tomcat manager — found in exposed .git history" },
    { id: "c3",  label: "postgres:Pg@dm1n#",          type: "credential",    detail: "PostgreSQL superuser — leaked via /actuator/env" },
    { id: "c4",  label: "AWS_SECRET_KEY=wJalrXUtn…",  type: "credential",    detail: "AWS secret key in git commit 3f8a21c — S3 full-access policy" },
    { id: "c5",  label: "SYSTEM (AD)",                type: "credential",    detail: "Domain admin via NTLM relay from SMB signing bypass" },
    { id: "c6",  label: "svc_deploy:Deploy#99",       type: "credential",    detail: "Service account — found in Jenkins pipeline env vars" },
  ],

  links: [
    // targets → hosts
    { source: "t1",  target: "h1",  label: "resolves_to" },
    { source: "t2",  target: "h2",  label: "resolves_to" },
    { source: "t3",  target: "h3",  label: "resolves_to" },
    { source: "t4",  target: "h12", label: "resolves_to" },
    { source: "t5",  target: "h4",  label: "resolves_to" },
    { source: "t6",  target: "h5",  label: "resolves_to" },
    { source: "t7",  target: "h6",  label: "resolves_to" },

    // hosts → services
    { source: "h1",  target: "s1",  label: "exposes" },
    { source: "h1",  target: "s2",  label: "exposes" },
    { source: "h1",  target: "s3",  label: "exposes" },
    { source: "h2",  target: "s4",  label: "exposes" },
    { source: "h2",  target: "s3",  label: "exposes" },
    { source: "h3",  target: "s5",  label: "exposes" },
    { source: "h3",  target: "s6",  label: "exposes" },
    { source: "h4",  target: "s7",  label: "exposes" },
    { source: "h5",  target: "s8",  label: "exposes" },
    { source: "h6",  target: "s15", label: "exposes" },
    { source: "h6",  target: "s16", label: "exposes" },
    { source: "h7",  target: "s10", label: "exposes" },
    { source: "h8",  target: "s11", label: "exposes" },
    { source: "h9",  target: "s12", label: "exposes" },
    { source: "h10", target: "s13", label: "exposes" },
    { source: "h11", target: "s13", label: "exposes" },
    { source: "h11", target: "s14", label: "exposes" },
    { source: "h12", target: "s9",  label: "exposes" },

    // services → vulnerabilities
    { source: "s4",  target: "v1",  label: "has_vuln" },
    { source: "s4",  target: "v2",  label: "has_vuln" },
    { source: "s4",  target: "v12", label: "has_vuln" },
    { source: "s7",  target: "v3",  label: "has_vuln" },
    { source: "s8",  target: "v4",  label: "has_vuln" },
    { source: "s3",  target: "v5",  label: "has_vuln" },
    { source: "s15", target: "v6",  label: "has_vuln" },
    { source: "s9",  target: "v7",  label: "has_vuln" },
    { source: "s9",  target: "v14", label: "has_vuln" },
    { source: "s11", target: "v8",  label: "has_vuln" },
    { source: "s12", target: "v9",  label: "has_vuln" },
    { source: "s13", target: "v10", label: "has_vuln" },
    { source: "s14", target: "v11", label: "has_vuln" },
    { source: "s5",  target: "v13", label: "has_vuln" },
    { source: "s16", target: "v15", label: "has_vuln" },

    // vulnerabilities → credentials
    { source: "v3",  target: "c1",  label: "yields" },
    { source: "v4",  target: "c2",  label: "yields" },
    { source: "v12", target: "c3",  label: "yields" },
    { source: "v15", target: "c4",  label: "yields" },
    { source: "v15", target: "c2",  label: "yields" },
    { source: "v10", target: "c5",  label: "yields" },
    { source: "v3",  target: "c6",  label: "yields" },

    // lateral movement
    { source: "h4",  target: "h2",  label: "lateral_move" },  // Jenkins → API server (svc_deploy creds)
    { source: "h2",  target: "h7",  label: "lateral_move" },  // API → Postgres (leaked creds)
    { source: "h8",  target: "h7",  label: "lateral_move" },  // Redis → Postgres (same subnet)
    { source: "h9",  target: "h7",  label: "lateral_move" },  // ES → Postgres (internal)
    { source: "h10", target: "h11", label: "lateral_move" },  // DC → file server (pass-the-hash)
    { source: "h12", target: "h6",  label: "lateral_move" },  // VPN → internal dev VM
    { source: "h6",  target: "h8",  label: "lateral_move" },  // dev VM → Redis
    { source: "h6",  target: "h9",  label: "lateral_move" },  // dev VM → Elasticsearch
  ],
};

export const NODE_COLORS: Record<NodeType, string> = {
  target:        "#ef4444", // red
  host:          "#3b82f6", // blue
  service:       "#22c55e", // green
  vulnerability: "#f97316", // orange
  credential:    "#a855f7", // purple
};
