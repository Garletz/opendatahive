import { CartesianCoordinates, HexagonalCoordinates, HexDimensions } from '../../../types';

/**
 * Relates a set of continuous cartesian coordinates to a set of discreet hexagons. Considering +x is right, +y is down (HTML5 canvas) then by default +u is 
 * is +y and +v is to the bottom right (along the line of x=y). See the [READ.md]{@link https://github.com/chad-autry/canvas-hexagon} on github for an explanation with a picture
 */
export default class HexDefinition implements HexDimensions {
  public readonly edgeSize: number;
  public readonly vScale: number;
  public readonly rotation: number;
  public readonly edgeWidth: number;
  public readonly twiddle: 0 | 0.5;
  public readonly h: number;
  public readonly r: number;
  public readonly hexagon_half_wide_width: number;
  public readonly hexagon_wide_width: number;
  public readonly hexagon_edge_to_edge_width: number;
  public readonly hexagon_scaled_half_edge_size: number;
  public readonly hexagon_narrow_width: number;

  constructor(edgeSize: number, vScale: number, rotation: number = 0, edgeWidth: number = 0) {
    /**
     * The provided edge size for a hex
     */
    this.edgeSize = edgeSize;
    
    /**
     * The provided vScale
     */
    this.vScale = vScale;

    /**
     * The provided rotation of the coordinate system
     */
    this.rotation = rotation;
    
    /**
     * The provided edge width for a hex
     */
    this.edgeWidth = edgeWidth;
    
    /**
     * The twiddle factor used to center hexes on whole numbers (even edgeSize) or in between whole numbers
     * @private
     */
    this.twiddle = (edgeSize % 2) ? 0.5 : 0; //0 if even, 0.5 if odd

    /**
     * The height of the triangles, if the hex were composed of a rectangle with triangles on top and bottom
     * @private
     */
    this.h = Math.sin(30 * Math.PI / 180) * this.edgeSize; 
    
    /**
     * The width of the triangles, if the two previous triangles were actually composed of mirrored right angle triangles
     * @private
     */
    this.r = Math.cos(30 * Math.PI / 180) * this.edgeSize;
    
    /**
     * Important value, will be added/subtracted from a Hex's center pixel co-ordinate to get 2 of the point co-ordinates
     * If edgeWidth is odd, we discount the center pixel (thus the "- this.twiddle" value)
     * The end result must be a whole number, so that the twiddle factor of the central co-ordinate remains when figuring out the point co-ordinates
     */
    this.hexagon_half_wide_width = Math.round(this.vScale*(this.edgeSize/2 + this.h));
    
    this.hexagon_wide_width = 2 * this.hexagon_half_wide_width; //the vertical width (hex point up), will be used to calculate co-ord conversions. Needs to be accurate to our roundings above

    this.hexagon_edge_to_edge_width = 2 * Math.round(this.r); //We need this to be a whole, even number. Will be divided by 2 and added to the central co-ordinate
    this.hexagon_scaled_half_edge_size = Math.round(this.vScale * (this.edgeSize/2)); //Need this to be a whole number. Will be added to the central co-ordinate to figure a point
    
    /**
     * This is not a measurement of a single hex. It is the y distance of two adjacent hexes in different y rows when they are oriented horizontal up
     * Used for co-ordinate conversion
     * Could be calculated as this.edgeSize + h, but need it accurate to our other rounded values
     */
    this.hexagon_narrow_width = this.hexagon_half_wide_width + this.hexagon_scaled_half_edge_size;
  }

  /**
   * Calculates the cartesian coordinates coresponding to the the center of a hexagon
   * @param u - The u coordinate of the hex
   * @param v - The v coordinate of the hex
   * @returns CartesianCoordinates
   */
  getPixelCoordinates(u: number, v: number): CartesianCoordinates {
    //values pre-scaled in the calculation above
    const y = this.hexagon_narrow_width * u + this.twiddle;

    //hexagon_edge_to_edge_width is a whole, even number. Dividing by 2 gives a whole number
    const x = this.hexagon_edge_to_edge_width * (u * 0.5 + v) + this.twiddle;

    return { x, y };
  }

  /**
   * Calculate the hexagonal coordinates corresponding to the given cartesian coordinates
   * @param x - The x coordinate
   * @param y - The y coordinate
   * @returns HexagonalCoordinates
   */
  getReferencePoint(x: number, y: number): HexagonalCoordinates {
    const u = Math.round(y / this.hexagon_narrow_width);
    const v = Math.round(x / this.hexagon_edge_to_edge_width - u * 0.5);
    return { u, v };
  }
} 