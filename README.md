# Carnival Ticket Revenue Calculator

A dynamic web application for analyzing and simulating ticket revenue for the Carnival of Sciacca. Built with Next.js 14 and modern React patterns.

![Carnival Ticket Calculator](./public/preview.png)

## Features

- 🎫 Dynamic ticket distribution simulation
- 💰 Real-time revenue calculations
- 📊 Interactive data visualization
- 🔄 Automatic percentage balancing
- 💸 Customizable municipal revenue share
- 📱 Fully responsive design

## Technical Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/carnival-ticket-calculator.git
cd carnival-ticket-calculator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Application Structure

- `app/` - Next.js app router pages and layouts
- `components/` - React components
  - `TicketAnalysis.tsx` - Main calculator component
  - `ui/` - shadcn/ui components
- `public/` - Static assets
- `styles/` - Global styles and Tailwind configuration

## Key Features Explained

### Ticket Distribution

- Supports multiple ticket types:
  - Single tickets (Online, Pre-event, During event)
  - Two-day passes (Offline, Pre-event)
  - Open passes
  - Special resident rates

### Revenue Calculation

Automatically calculates:
- Gross revenue
- Net revenue after taxes and fees
- Municipal share (customizable percentage)
- Final net revenue
- Fees and commissions

### Automatic Balancing

The distribution system features:
- Automatic percentage balancing
- Proportional redistribution
- Manual override option
- Real-time total validation

## Configuration

### Ticket Types

Ticket types and their properties are defined in the `TicketAnalysis` component:

```typescript
type DistributionType = {
  ticketOnline: number
  ticketPreEvent: number
  ticketDuringEvent: number
  twoDayOffline: number
  twoDayPreEvent: number
  openTicket: number
}
```

### Price Structure

Each ticket type has a base price and optional fee:

```typescript
type PriceType = {
  base: number
  fee: number
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
