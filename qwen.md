# MAS (Modern Application Suite) - Restaurant & Retail Management System

## Project Overview

MAS is a comprehensive SaaS solution for restaurant and retail operations, featuring a suite of applications built with React, TypeScript, and modern web technologies. The system follows a modular architecture with separate applications for different business functions, all unified under a single portal interface.

## Technology Stack

- **Frontend**: React 18 + TypeScript via Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: Custom component library (@mas/ui)
- **Routing**: React Router v7
- **Animations**: Framer Motion + GSAP
- **Data Persistence**: LocalForage (IndexedDB wrapper)
- **UI Library**: Lucide React icons
- **Build Tool**: Vite
- **Offline Support**: IndexedDB cache with offline order queuing

## Architecture

### Monorepo Structure
```
src/
├── components/
│   ├── apps/           # Individual application modules
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (AppShell, Footer, etc.)
│   ├── ui/             # Shared UI components
│   └── ...
├── config/             # Configuration files
├── data/               # Mock data and constants
├── packages/
│   └── ui/            # Reusable UI component library
├── providers/          # React context providers
├── stores/             # Zustand stores for state management
├── styles/             # CSS and styling files
└── types/              # TypeScript type definitions
```

### Core Providers

1. **ThemeProvider** - Manages dark/light mode and paper shader settings
2. **UXProvider** - Centralizes modals, toasts, and confirmation dialogs
3. **LoadingProvider** - Supplies global loading overlays

## Application Modules

### 1. Portal (/portal)
The main dashboard and application launcher featuring:
- Suite overview with analytics
- Quick action cards
- Application grid with role-based filtering
- Usage metrics carousel
- Alerts and notifications
- Recent activity feed

### 2. Point of Sale (/pos)
Core POS functionality with:
- Product catalog with category tabs
- Search functionality
- Cart management with quantity controls
- Order type selection (dine-in/takeaway)
- Customer management
- Table management (restaurant mode)
- Barcode scanning support
- Modifier selection for products
- Offline order queuing
- Payment processing flow

### 3. Kitchen Display System (/kds)
Lite kitchen display system with:
- Station-based ticket management
- Order status tracking (firing, plating, waiting)
- Ticket bumping functionality
- Timer displays
- Station filtering

### 4. Product Catalog (/products)
Product management features:
- Product listing with categories
- Product creation form
- Variant management
- Barcode and SKU tracking
- Category management
- Promotion badge display

### 5. Inventory Management (/inventory)
Inventory tracking capabilities:
- Stock level monitoring
- Transfer management
- Low stock alerts
- Pending movements tracking
- Stock count scheduling

### 6. Purchasing (/purchasing)
Supplier and procurement management:
- Purchase order tracking
- Goods received notes
- Supplier invoice management
- Outstanding invoice tracking

### 7. Customer Management (/customers)
CRM and loyalty system:
- Customer database
- Loyalty program management
- Store credit tracking
- Customer search functionality
- Segmentation analytics

### 8. Promotions (/promotions)
Promotional campaign builder:
- Rule-based promotion engine
- Campaign management
- Eligibility configuration
- Scheduling controls
- Stacking rules
- Preview badges

### 9. Reports (/reports)
Analytics and reporting:
- Sales performance dashboards
- Daily sales trends
- Revenue by channel
- Top performing items
- Export functionality
- Date range filtering

### 10. Calendar (/calendar)
Scheduling and task management:
- Event calendar view
- Reservation management
- Task board
- Stock count scheduling
- PO arrival tracking

### 11. Accounting (/accounting)
Financial management:
- Daybook journal entries
- Tax payable tracking
- Ledger management
- Financial exports

### 12. Imports (/imports)
Data import system:
- CSV template management
- Dry-run validation
- Import history tracking
- Error reporting

### 13. Devices (/devices)
Device management:
- Register pairing
- Printer management
- Scanner configuration
- Device diagnostics
- Connection health monitoring

### 14. Back Office (/backoffice)
Administrative settings:
- Business information management
- Operating hours configuration
- Receipt settings
- Tax configuration
- Currency and timezone settings
- Theme mode control
- Paper shader customization
- Inventory settings

## Design System

### Color Palette
- **Primary**: #E44343 (Red)
- **Background**: #ECEBE8 (Light) / #141419 (Dark)
- **Surface**: #F5F5F4 (Light) / #24242E (Dark)
- **Text**: #0A0A0A (Light) / #F0F0F4 (Dark)
- **Status Colors**: Success (#148A3B), Warning (#C48A0A), Danger (#B21E1E)

### Typography
- **Font Family**: Inter with tabular numbers for prices
- **Heading Scale**: 5 levels (XL to XS) with responsive sizing
- **Body Text**: 4 sizes (LG to XS) with appropriate line heights

### Spacing & Layout
- **Border Radius**: 8px (sm), 12px (md), 16px (lg)
- **Shadows**: Card and modal elevations
- **Responsive Breakpoints**: Mobile-first with lg breakpoint at 1024px

### Components
- **Buttons**: Primary, secondary, outline, ghost, destructive, link, tertiary variants
- **Forms**: Inputs, selects, textareas, checkboxes, radio groups
- **Cards**: Paper cards with optional shader effect
- **Navigation**: App shell with rail navigation, breadcrumbs, command palette
- **Feedback**: Toast notifications, loading states, skeleton screens

## State Management

### Zustand Stores

1. **authStore** - User authentication and session management
2. **cartStore** - POS cart functionality and order calculations
3. **offlineStore** - Offline order queuing and data caching
4. **themeStore** - Theme mode and paper shader settings

### Persistence
- Local storage for authentication state
- IndexedDB via LocalForage for offline data caching
- Session persistence with automatic hydration

## Offline Functionality

### POS Offline Mode
- IndexedDB cache for catalog, prices, taxes, and promotions
- Offline order queuing with idempotency keys
- Cash sales and printing capability while offline
- Automatic sync on reconnection
- Status indicator showing connectivity state

### Data Synchronization
- Queue-based order processing
- Conflict resolution on sync
- Last sync time tracking
- Failed sync retry mechanisms

## Theming & Customization

### Theme Modes
- Light mode
- Dark mode
- Auto mode (system preference)

### Paper Shader
- WebGL-based paper grain and fiber texture
- Configurable intensity and animation speed
- Surface-specific application (background, cards)
- Fallback SVG implementation for unsupported browsers
- Performance monitoring with auto-disable

### Tenant Customization
- Per-tenant branding settings
- Theme mode preferences
- Paper shader configurations
- Currency and timezone settings

## UI/UX Features

### Animations
- Framer Motion for component interactions
- GSAP for orchestrated sequences
- Page transitions with cross-fade
- Staggered grid animations
- Micro-interactions for buttons and cards

### Navigation
- Command palette with keyboard shortcuts (Ctrl/Cmd+K)
- Role-based app filtering
- Breadcrumb navigation
- Mobile-responsive drawer navigation

### Accessibility
- WCAG AA compliance
- Keyboard navigation support
- Focus-visible indicators
- ARIA labels for interactive elements
- Reduced motion support

## Security & Permissions

### Role-Based Access Control
- Cashier/Waiter/Bartender
- Supervisor
- Store Manager
- Inventory Manager
- Accountant
- Owner/Admin

### Authentication
- Email/password login
- Manager PIN for restricted actions
- Session management
- Role-based app access

## Performance Considerations

### Optimization Techniques
- Code splitting by route
- Lazy loading of components
- Memoization of expensive calculations
- Efficient re-rendering with Zustand
- Performance monitoring for paper shader
- Responsive image loading

### Offline Performance
- IndexedDB for fast local data access
- Minimal bundle size for PWA
- Efficient caching strategies
- Background sync capabilities

## Development Features

### Developer Experience
- TypeScript for type safety
- ESLint configuration
- Vite for fast builds
- Component-driven development
- Design token system
- Comprehensive mock data

### Testing
- Cypress E2E testing setup
- Unit testing capabilities
- Visual regression testing
- Accessibility testing

## Future Enhancements

### Planned Features
- Real API integration
- WebSocket-based real-time updates
- Advanced POS flows (modifiers, split tenders)
- Barcode scanning hardware integration
- Receipt printing functionality
- Multi-tenant SaaS architecture
- Advanced reporting and analytics
- Mobile app versions
- Integration with third-party services