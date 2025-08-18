# Optimize Database Queries

**Usage:** `/optimize_db_queries`

## Description
Analyzes and optimizes database queries for the referenciales.cl project using the specialized DatabaseManagerAgent. This command focuses on improving performance for spatial queries, large datasets, and frequently accessed property data.

## Command Implementation
```
use DatabaseManagerAgent to analyze and optimize slow database queries in the project. Focus on frequently accessed tables, complex PostGIS spatial joins, and Chilean property data queries. Provide performance benchmarks before and after optimization, and ensure all changes maintain data integrity and RLS policies.
```

## Optimization Areas
1. Slow query identification and analysis
2. Spatial index optimization for PostGIS queries
3. Query plan analysis and improvement
4. Index strategy for Chilean property identifiers
5. Aggregation query optimization
6. Connection pooling and caching strategies

## Performance Metrics
- Query execution time improvements
- Index utilization analysis
- Memory usage optimization
- Concurrent user impact assessment
- Geographic query performance (map data)

## Safety Measures
- Backup recommendations before changes
- Rollback procedures for failed optimizations
- RLS policy preservation
- Data integrity validation

## Example Usage
```
/optimize_db_queries
```