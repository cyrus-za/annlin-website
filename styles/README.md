# Styles Directory

This directory is reserved for additional CSS files and style-related utilities beyond the main Tailwind CSS configuration.

## Structure

- **Global styles**: Additional global CSS that can't be handled by Tailwind
- **Component styles**: CSS modules for specific components if needed
- **Print styles**: Styles for print media
- **Utility styles**: Custom CSS utilities not covered by Tailwind

## Usage

Most styling should be done using Tailwind CSS classes. This directory is for:

1. **Complex animations** that require keyframes
2. **Print-specific styles** for documents
3. **Third-party integration styles** that can't be modified
4. **Legacy styles** during migration from WordPress

## Example Files

```
styles/
├── globals.css          # Additional global styles
├── print.css           # Print-specific styles
├── animations.css      # Custom animations
└── components/         # Component-specific CSS modules
    ├── calendar.module.css
    └── editor.module.css
```

## Best Practices

1. Prefer Tailwind CSS classes over custom CSS
2. Use CSS modules for component-specific styles
3. Keep styles close to components when possible
4. Use semantic class names
5. Document any complex CSS with comments
