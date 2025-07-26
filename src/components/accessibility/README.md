# Accessibility Components

This directory contains a comprehensive set of accessible React components that comply with WCAG 2.1 AA standards. All components are designed to work seamlessly with screen readers, keyboard navigation, and various accessibility preferences.

## Components Overview

### Core Components

#### AccessibleButton
- WCAG compliant button with proper ARIA attributes
- Loading states with screen reader announcements
- Keyboard navigation support
- Multiple variants (primary, secondary, danger, ghost)

#### AccessibleModal
- Focus trap management
- Proper ARIA roles and labels
- Keyboard navigation (Escape to close)
- Screen reader announcements

#### Form Components
- **AccessibleInput**: Text input with proper labeling and validation
- **AccessibleTextarea**: Multi-line text input
- **AccessibleSelect**: Dropdown selection with keyboard navigation
- **AccessibleCheckbox**: Checkbox with proper labeling
- **AccessibleRadioGroup**: Radio button group with fieldset

### Navigation Components

#### AccessibleNavigation
- Keyboard navigation with arrow keys
- ARIA menubar/menu roles
- Expandable submenus
- Screen reader announcements

#### MobileAccessibleNavigation
- Mobile-friendly hamburger menu
- Focus management
- Proper ARIA attributes

#### AccessibleBreadcrumb
- Semantic breadcrumb navigation
- Current page indication
- Proper link structure

#### AccessibleDropdown
- Keyboard navigation
- Focus trap when open
- ARIA menu roles
- Click outside to close

### Data Display Components

#### AccessibleTable
- Proper table headers and scope
- Sortable columns with ARIA sort attributes
- Keyboard navigation for sorting
- Screen reader friendly

#### AccessiblePaginatedTable
- Accessible pagination controls
- Page announcements
- Proper navigation labels

### Enhanced Form Components

#### AccessibleFormValidation
- Real-time validation with screen reader announcements
- Error summary for easy navigation
- Proper error associations
- Required field indicators

#### AccessibleMultiStepForm
- Progress indicator
- Step navigation
- Form state management
- Accessibility announcements

### Utility Components

#### SkipLinks
- Keyboard navigation shortcuts
- Hidden until focused
- Smooth scrolling to targets

#### LiveRegion
- Screen reader announcements
- Polite and assertive priorities
- Automatic cleanup

#### AccessibilitySettings
- User preference controls
- Font size adjustment
- Motion and contrast preferences
- Settings persistence

## Usage Examples

### Basic Button
```tsx
import { AccessibleButton } from './components/accessibility';

<AccessibleButton
  onClick={handleClick}
  variant="primary"
  ariaLabel="Save document"
>
  Save
</AccessibleButton>
```

### Form with Validation
```tsx
import { AccessibleFormValidation } from './components/accessibility';

const fields = [
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    validation: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
  }
];

<AccessibleFormValidation
  fields={fields}
  onSubmit={handleSubmit}
  submitLabel="Subscribe"
/>
```

### Navigation Menu
```tsx
import { AccessibleNavigation } from './components/accessibility';

const navItems = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'about', label: 'About', href: '/about' }
];

<AccessibleNavigation
  items={navItems}
  ariaLabel="Main navigation"
/>
```

### Data Table
```tsx
import { AccessibleTable } from './components/accessibility';

const columns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', sortable: true }
];

<AccessibleTable
  columns={columns}
  data={users}
  caption="User directory"
  sortable={true}
/>
```

## Accessibility Features

### WCAG 2.1 AA Compliance
- ✅ Proper semantic HTML structure
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Color contrast ratios (4.5:1 minimum)
- ✅ Focus management
- ✅ ARIA labels and roles
- ✅ Error identification and description
- ✅ Consistent navigation

### Keyboard Navigation
- Tab/Shift+Tab for focus navigation
- Arrow keys for menu/list navigation
- Enter/Space for activation
- Escape for closing modals/menus
- Home/End for first/last item navigation

### Screen Reader Support
- Proper ARIA attributes
- Live region announcements
- Descriptive labels
- Status updates
- Error announcements

### User Preferences
- Reduced motion support
- High contrast mode
- Font size adjustment
- Focus indicator enhancement

## Testing

### Automated Testing
Use the `AccessibilityTester` component for development testing:

```tsx
import { AccessibilityTester } from './components/dev/AccessibilityTester';

// Add to your development environment
<AccessibilityTester />
```

### Manual Testing Checklist
- [ ] All interactive elements are keyboard accessible
- [ ] Screen reader announces all important information
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible
- [ ] Error messages are properly associated
- [ ] Form labels are descriptive
- [ ] Navigation is consistent

### Tools
- **axe-core**: Automated accessibility testing
- **NVDA/JAWS**: Screen reader testing
- **Lighthouse**: Accessibility audit
- **Color Contrast Analyzer**: Contrast checking

## Best Practices

1. **Always provide labels**: Use proper labels for form controls
2. **Manage focus**: Ensure logical focus order and trap focus in modals
3. **Use semantic HTML**: Choose appropriate HTML elements
4. **Provide alternatives**: Alt text for images, captions for videos
5. **Test with users**: Include users with disabilities in testing
6. **Progressive enhancement**: Ensure basic functionality without JavaScript

## Browser Support

These components are tested and supported in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

When adding new accessibility components:
1. Follow WCAG 2.1 AA guidelines
2. Include proper TypeScript types
3. Add comprehensive tests
4. Update documentation
5. Test with screen readers
6. Verify keyboard navigation