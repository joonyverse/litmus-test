# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a browser-based HTML5 Canvas art generator project. No build system or package manager is used.

- **Run the project**: Open `index.html` directly in a web browser
- **Development server**: Use any local HTTP server (e.g., `python -m http.server 8000`)

## Project Architecture

### Core Structure
This is a modular watercolor art generator that creates procedural bar patterns with interactive color customization.

**Main Application Flow**:
- `main.js` - Core application logic and drawing orchestration
- `config.js` - Configuration, GUI setup, and settings persistence
- `index.html` - Entry point with canvas element and dat.GUI dependency

### Key Architectural Components

**Layer Management System** (`utils/layer.js`):
- Canvas-based layer system for separating bars, lines, and effects
- Compositing pipeline: bars → lines → effects → final output
- Individual layer visibility toggling

**Drawing Classes** (`classes/`):
- `WatercolorBar` - Procedural watercolor bar rendering with bezier curves and blur effects
- `WatercolorLine` - Line overlays on bars with texture effects
- Each class handles its own canvas context and rendering logic

**Utility System** (`utils/`):
- Modular utilities: color manipulation, canvas operations, math helpers
- Centralized through `utils/index.js` barrel exports

**Configuration & GUI**:
- `config.js` manages all settings with localStorage persistence
- dat.GUI integration for real-time parameter adjustment
- Dynamic row offset controls that adapt to canvas dimensions

### Key Features

**Procedural Generation**:
- Seeded random functions for deterministic patterns
- Color grouping system with configurable group sizes
- Position-based deterministic randomization

**Interactive Color System**:
- Click-to-edit individual bar/line colors
- Global color palette management
- Individual color overrides stored separately from global settings

**Blanking System**:
- Procedural hiding of elements based on percentage and seed
- Configurable blanking patterns

## Technical Notes

- Uses ES6 modules with relative imports
- No build step - runs directly in modern browsers
- All randomization is seeded for reproducible results
- Canvas operations use save/restore pattern for state management
- Color persistence uses localStorage with fallback handling