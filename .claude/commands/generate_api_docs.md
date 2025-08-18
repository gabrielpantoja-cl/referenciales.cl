# Generate API Documentation

**Usage:** `/generate_api_docs`

## Description
Generates comprehensive OpenAPI documentation for all referenciales.cl API endpoints using the specialized APIDeveloperAgent. This command creates up-to-date, interactive documentation for both public and private APIs.

## Command Implementation
```
use APIDeveloperAgent to generate up-to-date OpenAPI 3.0 documentation for all existing API endpoints. Include Chilean-specific examples, property identifier documentation, and comprehensive error response schemas. Create both interactive and static documentation formats.
```

## Documentation Features
1. OpenAPI 3.0 compliant specification
2. Interactive Swagger UI interface
3. Chilean real estate context and examples
4. Complete request/response schemas
5. Authentication flow documentation
6. Error handling documentation
7. Rate limiting and CORS information

## Generated Outputs
- `docs/api/openapi.json` - OpenAPI specification
- `docs/api/swagger.html` - Interactive documentation
- `README_API.md` - Quick start guide
- Examples and integration guides

## Example Usage
```
/generate_api_docs
```