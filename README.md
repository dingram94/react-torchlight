# 🔦 React Torchlight

<div align="center">

![React Torchlight Logo](https://img.shields.io/badge/React-Torchlight-blue?style=for-the-badge&logo=react)

**A powerful, type-safe React library for creating interactive tours and walkthroughs**

[![npm version](https://img.shields.io/npm/v/react-torchlight?style=flat-square)](https://www.npmjs.com/package/react-torchlight)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/react-torchlight?style=flat-square)](https://bundlephobia.com/package/react-torchlight)

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [API](#-api) • [Examples](#-examples)

</div>

---

## ✨ Features

- 🎯 **Type-Safe Tour IDs** - Auto-generated TypeScript types for your tour IDs
- 🎨 **Customizable Styling** - Full control over appearance with CSS variables and custom props
- ♿ **Accessibility First** - Built with WCAG guidelines in mind, keyboard navigation included
- 🔧 **Developer Experience** - Vite and TypeScript plugins for seamless integration
- 🎭 **Flexible Positioning** - Smart tooltip positioning that adapts to screen boundaries
- ⚡ **Performance Optimized** - Minimal bundle size with tree-shaking support

## 📦 Installation

```bash
# npm
npm install react-torchlight
```

### CSS Import

Don't forget to import the CSS styles:

```tsx
import "react-torchlight/css/styles.css";
```

## 🚀 Quick Start

### 1. Wrap your app with TorchlightProvider

```tsx
import React from "react";
import { TorchlightProvider } from "react-torchlight";
import "react-torchlight/css/styles.css";

function App() {
  return (
    <TorchlightProvider>
      <YourApp />
    </TorchlightProvider>
  );
}
```

### 2. Create tour steps in your components

```tsx
import React from "react";
import { useTorchlightSteps } from "react-torchlight";

function Dashboard() {
  // Define your tour steps with type safety
  const refs = useTorchlightSteps("dashboard-tour", [
    {
      id: "welcome-message",
      order: 1,
      title: "Welcome!",
      content: "This is your dashboard where you can see all your data.",
      placement: "bottom",
    },
    {
      id: "user-profile",
      order: 2,
      title: "Your Profile",
      content: "Click here to edit your profile information.",
      placement: "left",
    },
    {
      id: "settings-menu",
      order: 3,
      title: "Settings",
      content: "Access all your preferences from here.",
      placement: "bottom",
    },
  ]);

  return (
    <div>
      <div ref={refs["welcome-message"]}>
        <h1>Welcome to Dashboard!</h1>
      </div>

      <div ref={refs["user-profile"]}>
        <UserProfile />
      </div>

      <div ref={refs["settings-menu"]}>
        <SettingsButton />
      </div>
    </div>
  );
}
```

### 3. Start your tour

```tsx
import React from "react";
import { useTorchlight } from "react-torchlight";

function StartTourButton() {
  const { startTour } = useTorchlight();

  return (
    <button onClick={() => startTour("dashboard-tour")}>
      Start Dashboard Tour
    </button>
  );
}
```

## 🔧 Setup with Vite (Recommended)

For the best developer experience with auto-generated TypeScript types:

### 1. Install the Vite plugin

```bash
npm install --save-dev react-torchlight
```

### 2. Add to your `vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { torchlightVitePlugin } from "react-torchlight/plugins/vite";

export default defineConfig({
  plugins: [
    react(),
    torchlightVitePlugin({
      rootFolder: "src",
      outputPath: "torchlight.gen.ts",
    }),
  ],
});
```

### 3. Import the generated types

```ts
// This enables type safety for your tour IDs
import "./torchlight.gen";
```

Now you'll get TypeScript autocomplete and validation for all your tour IDs! 🎉

## 📖 API Reference

### Components

#### `<TorchlightProvider>`

The main provider component that manages tour state.

```tsx
<TorchlightProvider
  config={{
    locale: {
      nextButtonText: "Next",
      prevButtonText: "Previous",
      skipButtonText: "Skip",
      doneButtonText: "Finish",
    },
  }}
  overlayProps={{
    overlayColor: "#000000",
    overlayOpacity: 0.7,
    highlightPadding: 8,
    borderRadius: 8,
    animationDuration: 300,
  }}
>
  {children}
</TorchlightProvider>
```

### Hooks

#### `useTorchlight()`

Access tour control functions.

```tsx
const {
  tours, // Map of all registered tours
  activeTour, // Currently active tour ID
  startTour, // Start a tour by ID
  stopTour, // Stop a tour by ID
  nextStep, // Go to next step
  prevStep, // Go to previous step
  goToStep, // Jump to specific step
} = useTorchlight();
```

#### `useTorchlightSteps(tourId, steps)`

Register tour steps and get element refs.

```tsx
const refs = useTorchlightSteps("my-tour", [
  {
    id: "step-1",
    order: 1,
    title: "Step Title",
    content: "Step description",
    placement: "bottom", // 'top' | 'bottom' | 'left' | 'right'
  },
]);

// Use the refs
<div ref={refs["step-1"]}>Content to highlight</div>;
```

## 🎨 Styling & Customization

### CSS Custom Properties

```css
:root {
  --torchlight-overlay-color: #000000;
  --torchlight-overlay-opacity: 0.7;
  --torchlight-highlight-border: #3b82f6;
  --torchlight-tooltip-bg: #ffffff;
  --torchlight-tooltip-text: #1f2937;
  --torchlight-border-radius: 8px;
}
```

### Custom Overlay Props

```tsx
<TorchlightProvider
  overlayProps={{
    className: 'my-custom-overlay',
    overlayColor: '#1a202c',
    overlayOpacity: 0.8,
    highlightPadding: 12,
    borderRadius: 12,
    animationDuration: 400,
    showTooltip: true,
    tooltipClassName: 'my-custom-tooltip'
  }}
>
```

## 🌟 Examples

### Basic Tour

```tsx
function BasicExample() {
  const { startTour } = useTorchlight();
  const refs = useTorchlightSteps("intro-tour", [
    {
      id: "header",
      order: 1,
      title: "Main Header",
      content: "This is the main navigation area.",
      placement: "bottom",
    },
    {
      id: "sidebar",
      order: 2,
      title: "Sidebar",
      content: "Use this sidebar to navigate between sections.",
      placement: "right",
    },
  ]);

  return (
    <div>
      <header ref={refs.header}>
        <h1>My App</h1>
        <button onClick={() => startTour("intro-tour")}>Take Tour</button>
      </header>
      <aside ref={refs.sidebar}>
        <nav>Navigation items...</nav>
      </aside>
    </div>
  );
}
```

### Multi-Step Onboarding

```tsx
function OnboardingFlow() {
  const { startTour, activeTour, stopTour } = useTorchlight();

  const welcomeRefs = useTorchlightSteps("welcome-tour", [
    {
      id: "welcome",
      order: 1,
      title: "Welcome! 👋",
      content: "Let's get you started with a quick tour.",
      placement: "bottom",
    },
  ]);

  const featureRefs = useTorchlightSteps("features-tour", [
    {
      id: "feature-1",
      order: 1,
      title: "Feature One",
      content: "This is an amazing feature you'll love!",
      placement: "right",
    },
    {
      id: "feature-2",
      order: 2,
      title: "Feature Two",
      content: "And this one will save you tons of time.",
      placement: "left",
    },
  ]);

  const handleStartOnboarding = () => {
    startTour("welcome-tour");
    // You can chain tours or use tour completion callbacks
  };

  return (
    <div>
      <div ref={welcomeRefs.welcome}>
        <h1>Welcome to Our App!</h1>
        <button onClick={handleStartOnboarding}>Start Onboarding</button>
      </div>

      <div className="features">
        <div ref={featureRefs["feature-1"]}>
          <FeatureOne />
        </div>
        <div ref={featureRefs["feature-2"]}>
          <FeatureTwo />
        </div>
      </div>
    </div>
  );
}
```

## ⌨️ Keyboard Navigation

- `Escape` - Exit current tour
- `Arrow Right` or `Space` - Next step
- `Arrow Left` - Previous step

## 🛠️ Development

### Build Tools Support

- ✅ **Vite** - Full plugin support with auto-generated types
- ✅ **TypeScript** - Built-in TypeScript plugin
- ✅ **Webpack** - Works out of the box
- ✅ **Next.js** - Compatible with SSR

### TypeScript Integration

The library provides excellent TypeScript support with auto-generated types for your tour IDs when using the Vite plugin.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the need for better user onboarding experiences
- Built with modern React patterns and TypeScript best practices
- Thanks to all contributors who help make this library better

---

<div align="center">
  <strong>Made with ❤️ by <a href="https://github.com/dingram94">Dominic Bryan Ingram</a></strong>
</div>

<div align="center">
  <sub>⭐ Star us on GitHub if this project helped you!</sub>
</div>
