//A place to define global items

/**
 * A callback to be used for implementing the logic of dragging items
 */
export type OnDrag = (x: number, y: number, dx: number, dy: number) => void;

/**
 * A callback to be called when the mouse is clicked on an item
 */
export type OnClick = (x: number, y: number) => void; 