export interface Point {
  x:number;
  y:number;
}

export interface Line {
  p1: Point,
  p2: Point
}

export class Utils {
    static angleToXAxis(line: Line) {
      const [dx, dy] = [(line.p2.x - line.p1.x), (line.p2.y - line.p1.y)];
      const length = Math.sqrt(dx*dx + dy*dy);
      const cos = dx/length;
      return Math.acos(cos);
  }


  // Find the new point that is at l
  static projectFromPoint(p: Point, a:number, l:number) : Point {
    return {
        x: p.x + l*Math.cos(a),
        y: p.y + l*Math.sin(a)
    }
  }

}

