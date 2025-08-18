# Security Scan

**Usage:** `/security_scan`

## Description
Executes a comprehensive security audit of the referenciales.cl project using the specialized SecurityAuditorAgent. This command performs vulnerability assessment according to OWASP guidelines and Chilean data protection requirements.

## Command Implementation
```
use SecurityAuditorAgent to perform a comprehensive security audit of the codebase, database configurations, and API endpoints. Report any vulnerabilities found according to OWASP Top 10 guidelines, focusing on Chilean real estate data protection and privacy compliance.
```

## Audit Coverage
1. OWASP Top 10 vulnerability assessment
2. Database security review (RLS policies, access controls)
3. Authentication and authorization testing
4. Input validation and injection prevention
5. Chilean data protection compliance check
6. API security analysis
7. Configuration security review

## Output
- Detailed vulnerability report with CVSS scores
- Risk prioritization and remediation recommendations
- Compliance gap analysis
- Security improvement roadmap

## Example Usage
```
/security_scan
```