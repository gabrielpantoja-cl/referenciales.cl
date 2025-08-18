# Ingest Chilean Real Estate Data

**Usage:** `/ingest_chile_data <source_file>`

## Description
Initiates the data ingestion process for Chilean real estate transaction data using the specialized DataIngestionAgent. This command handles validation, cleaning, and normalization of data from the Conservador de Bienes Raíces.

## Command Implementation
```
use DataIngestionAgent to process the data from $ARGUMENTS and store it in the database. Ensure comprehensive data validation, address normalization, and compliance with Chilean property identifier standards (ROL, fojas, CBR, año). Generate quality metrics report upon completion.
```

## Parameters
- `<source_file>`: Path to the data file (CSV, JSON, or XML format)

## Expected Process
1. File format validation and parsing
2. Chilean property identifier validation
3. Address normalization and geocoding
4. Price validation and outlier detection
5. Database insertion with error handling
6. Quality metrics and error reporting

## Example Usage
```
/ingest_chile_data data/cbr_santiago_2024.csv
/ingest_chile_data imports/transacciones_q1.json
```