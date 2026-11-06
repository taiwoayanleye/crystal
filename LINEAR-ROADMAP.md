# Crystal Dashboard — Linear Roadmap
## Multi-Phase Build Plan with Multi-Source Connector Support

**Project Name:** Crystal (rename from "Prism" in Linear)  
**Status:** Ready for implementation  
**Timeline:** 5-7 days to MVP + feature roadmap

---

## Phase 1: MVP (This Week - Nov 5-10)

### Foundation
- [x] Design complete (pen.dev)
- [x] Directory structure created
- [ ] Backend scaffolding (Node.js + Express)
- [ ] React + Next.js setup
- [ ] Database schema (SQLite)

### Core Features
**TAI-11:** Backend scaffolding + CSV data ingestion
- Express server setup
- CSV upload endpoint
- Schema detection
- SQLite storage

**TAI-12:** React dashboard UI + layout components
- Dashboard home page
- Left sidebar
- Product card grid
- Responsive layout

**TAI-13:** Quality metrics dashboard (freshness, completeness, accuracy)
- Progress bar components
- Metric calculations
- Quality scoring logic

**TAI-14:** Usage metrics + adoption tracking
- Usage metric display
- 30-day trend chart
- Adoption percentage tracking

**TAI-15:** Claude API chat integration for data insights
- Chat panel component
- Chat API endpoint
- Message history storage
- Context-aware responses

**TAI-16:** Data lineage visualization (ETL flow)
- Flow diagram component
- Dependency mapping
- Status legend

**TAI-17:** Testing + edge case handling
- Unit tests
- Integration tests
- Error handling

**TAI-18:** Deploy to Vercel + GitHub setup
- Vercel deployment
- GitHub repo configuration
- CI/CD pipeline

**TAI-19:** Documentation + README (product story + usage guide)
- API documentation
- User guide
- Technical architecture

**TAI-20:** Outreach to a hiring contact (the target company) + application
- Personalized message
- Live demo link
- Application submission

---

## Phase 2: Multi-Source Connectors (Next Week - Nov 11-15)

### Add Database Connections
**TAI-21:** PostgreSQL connector
- Connection form (host, port, database, username, password)
- Schema detection from INFORMATION_SCHEMA
- Test connection button
- Support for table/view selection

**TAI-22:** Snowflake connector
- Connection form (account ID, warehouse, database, schema)
- API authentication
- Schema auto-detection
- Query execution support

**TAI-23:** BigQuery connector
- Service account JSON upload
- Project ID configuration
- Dataset and table selection
- REST API integration

### Update Upload Modal
**TAI-24:** Data source type selector (CSV → Dropdown)
- Conditional form fields
- Dynamic content based on source type
- Test connection validation
- Error messaging

**TAI-25:** Unified data ingestion layer
- Connector abstraction (IDataConnector interface)
- Source-agnostic schema detection
- Metadata normalization
- Error handling for each connector type

### Support Multi-Source Metrics
**TAI-26:** Universal metric calculation for any source
- Quality metrics from any source
- Usage metrics tracking
- Outcome measurement (source-agnostic)
- Last sync timestamp display

**TAI-27:** Cloud storage integration (S3/GCS)
- AWS S3 connector
- Google Cloud Storage connector
- File format support (CSV, JSON, Parquet)
- Bucket/path configuration

---

## Phase 3: Scale (Later - Nov 16+)

### SaaS API Integrations
**TAI-28:** Stripe API connector
- API key authentication
- Resource type selector (Customers, Charges, Transactions)
- Incremental sync support
- Field mapping

**TAI-29:** Salesforce connector
- OAuth authentication
- SOQL query support
- Custom object support
- Incremental sync

**TAI-30:** HubSpot connector
- API key authentication
- Entity selection (Contacts, Companies, Deals)
- Property mapping
- Rate limiting

### Advanced Features
**TAI-31:** Query editor for databases
- SQL editor for custom queries
- Query validation
- Saved query templates
- Results preview

**TAI-32:** Scheduled/incremental syncs
- Refresh scheduling (hourly, daily, weekly)
- Incremental data fetching
- Sync history/logs
- Error retry logic

**TAI-33:** Data transformation (dbt integration)
- dbt project support
- Transformation lineage
- Model dependencies
- Refresh coordination

**TAI-34:** Advanced Chat features
- Multi-dataset analysis
- Cross-dataset joins
- Custom metric queries
- Report generation

---

## Roadmap Timeline

```
WEEK 1 (Nov 5-10):
├─ Phase 1: MVP
│  ├─ Backend scaffolding (CSV, SQLite)
│  ├─ React dashboard UI
│  ├─ Metrics display (quality, usage, outcome)
│  ├─ Claude chat integration
│  ├─ Data lineage visualization
│  ├─ Testing
│  ├─ Deploy to Vercel
│  └─ Documentation
└─ APPLY TO TARGET ROLE (Nov 10-15)

WEEK 2 (Nov 11-15):
├─ Phase 2: Multi-Source Connectors
│  ├─ PostgreSQL connector
│  ├─ Snowflake connector
│  ├─ BigQuery connector
│  ├─ Upload modal refactor
│  ├─ Unified ingestion layer
│  └─ Cloud storage (S3/GCS)

FUTURE:
└─ Phase 3: Scale (SaaS APIs, query editors, scheduling, dbt)
```

---

## Linear Issues Summary

### Phase 1 (MVP - 10 issues)
| # | Issue | Assignee | Status |
|---|-------|----------|--------|
| TAI-11 | Backend scaffolding + CSV ingestion | — | Backlog |
| TAI-12 | React dashboard UI | — | Backlog |
| TAI-13 | Quality metrics dashboard | — | Backlog |
| TAI-14 | Usage metrics + adoption | — | Backlog |
| TAI-15 | Claude API chat | — | Backlog |
| TAI-16 | Data lineage visualization | — | Backlog |
| TAI-17 | Testing + edge cases | — | Backlog |
| TAI-18 | Deploy to Vercel + GitHub | — | Backlog |
| TAI-19 | Documentation + README | — | Backlog |
| TAI-20 | Outreach + application | — | Backlog |

### Phase 2 (Multi-Source - 8 issues)
| # | Issue | Assignee | Status |
|---|-------|----------|--------|
| TAI-21 | PostgreSQL connector | — | Backlog |
| TAI-22 | Snowflake connector | — | Backlog |
| TAI-23 | BigQuery connector | — | Backlog |
| TAI-24 | Data source type selector | — | Backlog |
| TAI-25 | Unified ingestion layer | — | Backlog |
| TAI-26 | Universal metrics | — | Backlog |
| TAI-27 | Cloud storage (S3/GCS) | — | Backlog |

### Phase 3 (Scale - 8 issues)
| # | Issue | Assignee | Status |
|---|-------|----------|--------|
| TAI-28 | Stripe API connector | — | Backlog |
| TAI-29 | Salesforce connector | — | Backlog |
| TAI-30 | HubSpot connector | — | Backlog |
| TAI-31 | Query editor | — | Backlog |
| TAI-32 | Scheduled syncs | — | Backlog |
| TAI-33 | dbt integration | — | Backlog |
| TAI-34 | Advanced chat features | — | Backlog |

---

## Key Design Patterns

### Upload Modal Evolution
**Phase 1 (MVP):**
```
Source type: CSV (fixed)
↓
Drag-and-drop upload
```

**Phase 2:**
```
Source type: [CSV ▼]
├─ CSV → Drag-and-drop
├─ PostgreSQL → Connection form
├─ Snowflake → Connection form
└─ BigQuery → Service account upload
```

### Connector Abstraction (Backend)
```javascript
interface IDataConnector {
  connect(credentials): Promise<void>
  testConnection(): Promise<boolean>
  getSchema(): Promise<SchemaMetadata>
  fetchData(query, limit): Promise<Row[]>
  getMetrics(): Promise<DataMetrics>
}

Factory pattern:
getConnector(sourceType) → CSVConnector | PostgreSQLConnector | ...
```

### Metric Display (Universal)
- Quality metrics work for ANY source
- Usage metrics work for ANY source
- Outcome metrics work for ANY source
- Chat context adapts to source type

---

## Success Metrics

**Phase 1 MVP:**
- ✅ Live demo URL by Nov 10
- ✅ GitHub repo with clean documentation
- ✅ Application to the target company submitted by Nov 12
- ✅ Personalized outreach to a hiring contact

**Phase 2 Multi-Source:**
- ✅ PostgreSQL + Snowflake working
- ✅ Interface adapts to different sources
- ✅ Metrics display universally
- ✅ Chat works with any data source

**Phase 3 Scale:**
- ✅ SaaS integrations (Stripe, Salesforce, HubSpot)
- ✅ Advanced query/transformation support
- ✅ Scheduled refresh capability
- ✅ dbt integration for transformations

---

## Notes

- **Project name:** Change from "Prism" to "Crystal" in Linear project settings
- **Database:** MVP uses SQLite; Phase 2+ should upgrade to Snowflake/PostgreSQL for scale
- **API Rate Limits:** Plan for rate limiting on SaaS API connectors (Stripe, Salesforce, etc)
- **Backfill Strategy:** For Phase 2 connectors, plan historical data backfill approach
- **Auth:** Store credentials securely (encrypted fields, not plaintext)
- **Validation:** Test connection before creating dataset for all sources

---

**Created:** Nov 5, 2026  
**Updated:** Nov 5, 2026  
**Status:** Ready for Phase 1 Implementation
