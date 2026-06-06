# Inline CRUD Table Implementation Guide

## Overview

This document outlines the framework-agnostic architecture for implementing inline CRUD (Create, Read, Update, Delete) operations within data tables. The pattern emphasizes user experience through direct table manipulation, optimized state management, and clear separation of concerns.

## Core Architecture

### 1. Data Layer Separation

The implementation maintains two distinct data sources:

- **Server Data**: Persistent data from backend API
- **Local Data**: Temporary client-side data for new records

```
Table Display = Local Rows + Server Rows
```

This separation enables:

- Immediate UI feedback for new records
- Offline-like experience for create operations
- Clear distinction between pending and saved data

### 2. State Management Pattern

#### Core State Elements

```typescript
// Essential state variables
selectedRows: Array<Row>; // User-selected rows
isEditMode: boolean; // Edit mode toggle
editedData: Object<RowId, Row>; // Modified data cache
originalData: Object<RowId, Row>; // Original data snapshot
hasChanges: boolean; // Unsaved changes flag
localRows: Array<Row>; // New records pending creation
```

#### State Flow

1. **Selection Phase**: User selects rows for editing
2. **Edit Activation**: Edit mode enabled, data snapshots created
3. **Modification Phase**: Changes tracked in editedData
4. **Persistence Phase**: Changes sent to backend, state reset

### 3. Row Classification System

#### Row Types

- **Existing Rows**: Have persistent ID, stored in server
- **New Rows**: Temporary ID (prefixed), stored locally only
- **Edited Rows**: Existing rows with pending modifications

#### Identification Logic

```typescript
// Row type detection
isNewRow = (row) => row.isNew === true || row.id.startsWith('tmp-');
isExistingRow = (row) => !isNewRow(row);
isEditedRow = (rowId) => editedData[rowId] !== undefined;
```

## CRUD Operations Implementation

### Create Operation

#### Flow

1. User clicks "Add" button
2. New row created with temporary ID
3. Row added to localRows array
4. Row immediately editable without selection
5. Changes tracked in editedData
6. On save, new rows sent to create API
7. Create inputs live inside table cells or a feature-owned editor surface, not as a separate form block above the table

#### Key Features

- **Batch Creation**: Support multiple new rows (typically limited to 5)
- **Immediate Editing**: New rows are instantly editable
- **Validation**: Ensure required fields before save
- **Local Persistence**: New rows survive selection changes

### Read Operation

#### Data Composition

```typescript
displayData = [...localRows, ...serverRows];
```

#### Display Logic

- New rows appear at top of table
- Existing rows follow server data order
- Mixed display maintains data integrity

### Update Operation

#### Flow

1. User selects existing rows
2. User clicks "Edit" button
3. Edit mode enabled for selected rows
4. Original data snapshot preserved
5. Fields become editable inputs
6. Changes tracked in editedData
7. On save, changes sent to update API

#### Edit Mode Mechanics

- **Selective Editing**: Only selected rows become editable
- **Data Preservation**: Original values stored for comparison
- **Change Detection**: Track modifications vs. original data

### Delete Operation

#### Dual Delete Behavior

**New Rows**:

- Immediate removal from UI
- No API call required
- Clean up local state

**Existing Rows**:

- Status toggle (active/inactive)
- API call for persistence
- Visual feedback through toggle switch

## User Interface Patterns

### Conditional Rendering

#### Edit Mode Detection

```typescript
isEditable = (item) => {
  return (isEditMode && isRowSelected(item) && !isRowNew(item)) || isRowNew(item);
};
```

#### Input Type Selection

- **Text Fields**: String values (material_group, material_number)
- **Select Dropdowns**: Enumerated values (server options)
- **Toggle Switches**: Boolean status (active/inactive)

### Visual Feedback

#### State Indicators

- **Selection Highlight**: Selected rows visually distinct
- **Edit Mode**: Editable fields show input controls
- **Loading States**: Async operations show progress
- **Validation**: Required field indicators

#### Action Controls

- **Add Button**: Creates new rows (disabled during edit)
- **Edit Button**: Enables edit mode (requires selection)
- **Save Button**: Persists changes (enabled when changes exist)
- **Delete/Toggle**: Removes or deactivates rows

## Advanced Features

### Batch Operations

#### Multi-Row Selection

- **Limits**: Maximum 5 rows per operation
- **Mixed Types**: Support both new and existing rows
- **Validation**: Ensure operation viability

#### Concurrent Operations

- **Create + Update**: Save both types in single operation
- **Conflict Resolution**: Handle ID collisions
- **Rollback Support**: Restore original state on failure

### Data Validation

#### Field-Level Validation

```typescript
isCompleteNewRow = (row) => {
  return isFilled(row.server) && isFilled(row.material_group) && isFilled(row.extended_material_group) && isFilled(row.material_number);
};
```

#### Business Logic Enforcement

- **Required Fields**: Validate before save
- **Data Types**: Ensure correct input formats
- **Business Rules**: Apply domain-specific constraints

## Performance Optimizations

### State Management Efficiency

- **Selective Updates**: Only modify changed rows
- **Snapshot Strategy**: Preserve original data efficiently
- **Memory Management**: Clean up unused references

### UI Responsiveness

- **Local First**: Immediate UI feedback
- **Optimistic Updates**: Assume success, rollback on failure
- **Loading States**: Prevent duplicate operations

## Implementation Checklist

### Required Components

1. **State Management Hook**
   - Row selection tracking
   - Edit mode control
   - Change detection
   - Data snapshots

2. **Table Component**
   - Conditional rendering logic
   - Input field templates
   - Action button controls
   - Visual state indicators

3. **Data Service Layer**
   - Create API integration
   - Update API integration
   - Status toggle API
   - Error handling

### Key Functions

1. **Row Management**
   - `handleAdd()`: Create new rows
   - `enableEditMode()`: Enable editing
   - `handleFieldChange()`: Track modifications
   - `saveChanges()`: Persist data

2. **Validation Logic**
   - `isCompleteNewRow()`: Validate new rows
   - `isSelectable()`: Enforce selection limits
   - `canSave()`: Enable save conditionally

3. **State Utilities**
   - `isRowSelected()`: Selection detection
   - `isRowNew()`: New row identification
   - `getEditedValue()`: Display value resolution

## Best Practices

### User Experience

- **Immediate Feedback**: Show changes instantly
- **Clear Indicators**: Visual state communication
- **Intuitive Flow**: Logical operation sequence
- **Error Handling**: Graceful failure recovery

### Code Organization

- **Separation of Concerns**: UI, state, and data layers
- **Reusable Components**: Modular input templates
- **Type Safety**: Clear data contracts
- **Error Boundaries**: Robust error handling

### Performance

- **Optimistic Updates**: Assume success for UX
- **Batch Operations**: Minimize API calls
- **Memory Efficiency**: Clean up unused data
- **Lazy Loading**: Load data as needed

## Framework Adaptation

### React Implementation

```typescript
// State management with hooks
const [selectedRows, setSelectedRows] = useState([])
const [isEditMode, setIsEditMode] = useState(false)
const [editedData, setEditedData] = useState({})

// Conditional rendering with JSX
{isEditable(item) ? (
  <input value={getEditedValue(item.id, field)} />
) : (
  <span>{item[field]}</span>
)}
```

### Angular Implementation

```typescript
// Component state
@Input() data: any[]
selectedRows: any[] = []
isEditMode = false
editedData: {[key: string]: any} = {}

// Template directives
*ngIf="isEditable(item)"
[value]="getEditedValue(item.id, field)"
```

### Vanilla JavaScript

```javascript
// State management
let selectedRows = [];
let isEditMode = false;
let editedData = {};

// DOM manipulation
if (isEditable(item)) {
  element.innerHTML = `<input value="${getEditedValue(item.id, field)}">`;
} else {
  element.innerHTML = item[field];
}
```

## Conclusion

This inline CRUD table pattern provides a robust, user-friendly approach to data management. The framework-agnostic design ensures adaptability across different technologies while maintaining consistent user experience and data integrity principles.

The key success factors are:

- Clear state management
- Intuitive user interactions
- Robust error handling
- Performance optimization
- Framework flexibility
  \_Last Update at 2026-05-15 19:55:20\_
