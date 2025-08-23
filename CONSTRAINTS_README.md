# Constraints System Documentation

## Overview
The constraints system in the exam portal IDE has been updated to properly fetch and display constraints from the database with robust handling of different data formats.

## Database Schema
Constraints are now stored as an array of strings in the database:

```javascript
constraints: {
    type: [String], // Array of strings for better structure
    default: []
}
```

## Data Flow

### 1. Database Storage
- **New Format**: Array of strings `["constraint1", "constraint2", ...]`
- **Legacy Format**: Single string with delimiters (supported for backward compatibility)

### 2. Backend Processing
The IDE route in `index.js` fetches exam data and passes it to the EJS template through JSON:

```javascript
res.render('ide', { 
    exam: exam,
    timeRemaining: timeRemaining,
    examStarted: false,
    user: null
});
```

### 3. Frontend Processing
The `ide.js` file handles constraints with intelligent parsing:

#### Array Format (Preferred)
```javascript
constraints: [
    "2 ≤ nums.length ≤ 10⁴",
    "-10⁹ ≤ nums[i] ≤ 10⁹",
    "Only one valid answer exists."
]
```

#### String Format (Legacy Support)
- **JSON String**: Parses as JSON array
- **Newline Delimited**: Splits by `\n`
- **Bullet Points**: Splits by `•` or `-`
- **Single Constraint**: Treats as single item

## Features

### 1. Robust Parsing
- Handles both array and string formats
- Automatic delimiter detection
- Cleans up formatting (removes bullets, extra spaces)
- Fallback to default constraints if none provided

### 2. Clean Display
- Renders as HTML `<ul>` list
- Removes leading bullets/dashes
- Filters out empty constraints
- Professional formatting

### 3. Migration Support
A migration script (`migrate-constraints.js`) is provided to convert existing string constraints to array format:

```bash
node migrate-constraints.js
```

## Example Usage

### Sample Data Structure
```javascript
const question = {
    title: "Two Sum Problem",
    statement: "Find two numbers that add up to target...",
    constraints: [
        "2 ≤ nums.length ≤ 10⁴",
        "-10⁹ ≤ nums[i] ≤ 10⁹",
        "-10⁹ ≤ target ≤ 10⁹",
        "Only one valid answer exists."
    ],
    testCases: [...]
};
```

### Frontend Rendering
The constraints will automatically render as:
```html
<div class="problem-constraints">
    <h3 class="section-subtitle">Constraints</h3>
    <ul>
        <li>2 ≤ nums.length ≤ 10⁴</li>
        <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
        <li>-10⁹ ≤ target ≤ 10⁹</li>
        <li>Only one valid answer exists.</li>
    </ul>
</div>
```

## Styling
Constraints are styled with the existing CSS classes:
- `.problem-constraints`: Container styling
- `.section-subtitle`: Header styling
- `ul li`: List item styling with proper spacing and typography

## Error Handling
- Missing constraints: Shows default message
- Invalid format: Graceful fallback
- Empty constraints: Shows standard message
- DOM element missing: Logs error but doesn't break functionality

## Backward Compatibility
The system maintains full backward compatibility with existing string-based constraints while encouraging the use of the new array format for better structure and maintainability.
