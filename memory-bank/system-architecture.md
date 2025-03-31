# System Architecture (Updated 2025-03-27)

```mermaid
graph TD
    A[Excel File Upload] --> B[Universal Processor]
    B --> C[Data Validation]
    C --> D[Smart Type Detection]
    D --> E[Supabase Storage]
    E --> F[Visualization Engine]
    F --> G[Chart.js]
    F --> H[ECharts]
    G --> I[Standard Charts]
    G --> J[Premium Styling]
    H --> K[Advanced Visualizations]
    I --> L[Dashboard]
    J --> L
    K --> L
    L --> M[Interactive Features]
    M --> N[Filtering]
    M --> O[Drill-down]
    M --> P[Export]
    L --> Q[Real-time Updates]
    
    N1[Network Monitor] -->|Metrics| E
    N1 -->|Alerts| L
    
    style A fill:#4CAF50,stroke:#388E3C
    style B fill:#2196F3,stroke:#0b7dda
    style F fill:#FF9800,stroke:#f57c00
    style G fill:#9C27B0,stroke:#7b1fa2
    style H fill:#3F51B5,stroke:#303f9f
    style L fill:#607D8B,stroke:#455a64
    style N1 fill:#00BCD4,stroke:#0097A7
```

## Key Components:
1. **Data Processing Pipeline** (Green/Blue)
   - Universal Excel file handling
   - Dynamic schema detection
   - Smart data type inference

2. **Visualization Layer** (Purple/Blue)
   - Chart.js for core premium charts
   - ECharts for advanced visualizations
   - Shared state management

3. **Dashboard Features** (Gray)
   - Interactive filtering
   - Drill-down analytics
   - Multi-format exports
   - Real-time updates
