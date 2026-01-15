# UI Components

Ovaj direktorij sadrži UI komponente bazirane na shadcn/ui dizajn sistemu, importovane iz Figma projekta.

## Struktura

- `ui/` - Osnovne UI komponente (buttons, cards, dialogs, itd.)
- `figma/` - Specifične komponente iz Figma dizajna
- `navigation.tsx` - Glavna navigaciona komponenta

## Korištenje

Sve UI komponente se mogu importovati korištenjem `@/` aliasa:

```tsx
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
```

## Dostupne komponente

### Layout & Navigation
- `navigation-menu` - Menu navigacija
- `sidebar` - Sidebar komponenta
- `breadcrumb` - Breadcrumb navigacija
- `tabs` - Tab komponenta
- `separator` - Razdjelnik

### Forms & Inputs
- `button` - Dugmad
- `input` - Input polja
- `textarea` - Textarea
- `checkbox` - Checkbox
- `radio-group` - Radio grupa
- `select` - Select dropdown
- `switch` - Toggle switch
- `slider` - Slider
- `form` - Form wrapper

### Feedback & Overlays
- `dialog` - Modal dialog
- `alert-dialog` - Alert dialog
- `alert` - Alert poruke
- `toast` / `sonner` - Toast notifikacije
- `popover` - Popover
- `tooltip` - Tooltip
- `hover-card` - Hover card
- `drawer` - Drawer (mobile sheet)
- `sheet` - Side sheet

### Data Display
- `card` - Kartice
- `table` - Tabele
- `badge` - Badge oznake
- `avatar` - Avatar slike
- `progress` - Progress bar
- `skeleton` - Loading skeletoni
- `chart` - Grafikoni (Recharts)
- `carousel` - Carousel/slider

### Other
- `accordion` - Accordion
- `collapsible` - Collapsible sekcije
- `scroll-area` - Custom scroll area
- `command` - Command palette
- `calendar` - Kalendar picker
- `context-menu` - Kontekstni meni
- `dropdown-menu` - Dropdown meni
- `menubar` - Menu bar
- `pagination` - Paginacija
- `aspect-ratio` - Aspect ratio wrapper
- `toggle` - Toggle button
- `toggle-group` - Toggle button grupa
- `input-otp` - OTP input

## Stilovi

Sve komponente koriste CSS varijable definisane u [app/globals.css](../globals.css) za konzistentno stilizovanje.

### Light/Dark Mode

Projekat podržava dark mode putem `.dark` klase. Boje se automatski prilagođavaju.

## Utilities

- `lib/utils.ts` - `cn()` funkcija za kombinovanje Tailwind klasa
- `components/ui/use-mobile.ts` - Hook za detekciju mobilnih uređaja
