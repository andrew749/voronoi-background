// initialize object from library.
var voronoi = new Voronoi();

var width = window.innerWidth, height = window.innerHeight;
var boundingBox = {xl: 0, xr: width, yt:0, yb: height};
var points = randomPoints(100, width);

// get a voronoi object
var diagram = voronoi.compute(points, boundingBox);
var canvas = document.getElementById("background");
var context = canvas.getContext('2d');

// set dimensions of canvas to take up the full screen.
context.canvas.width = window.innerWidth;
context.canvas.height = window.innerHeight;

// Style the animation
context.strokeStyle = "#9E9E9E";

// generate random points for drawing.
function randomPoints(quantity, scale) {
  var points = [];
  for (var x = 0 ; x < quantity ; x++) {
    points.push({ x : Math.random() * scale, y : Math.random() * scale});
  }
  return points;
}

// draw the edges
function drawCell(context, cell){
  context.beginPath();
  if (cell.halfedges.length == 0 ) return;
  context.moveTo(cell.halfedges[0].edge.va.x, cell.halfedges[0].edge.va.y);
  for(index=1; index<cell.halfedges.length;index++) {
    context.lineTo(cell.halfedges[index].edge.vb.x, cell.halfedges[index].edge.vb.y);
  }
  context.closePath();
  context.stroke();
}

// draw a cell and fill it
function drawFillCell(context, cell) {
  context.beginPath();
  if (cell.halfedges.length == 0 ) return;
  context.moveTo(cell.halfedges[0].edge.va.x, cell.halfedges[0].edge.va.y);
  for(index=1; index<cell.halfedges.length;index++) {
    context.lineTo(cell.halfedges[index].edge.vb.x, cell.halfedges[index].edge.vb.y);
  }
  context.closePath();
  context.stroke();
  context.fill();
}

// draw a rectangle and fade it out
function fadeOutRectangle(ctx, cell, r,g,b) {
  var steps = 40,
    dr = (255 - r) / steps, // how much red should be added each time
    dg = (255 - g) / steps, // green
    db = (255 - b) / steps, // blue
    i = 0, // step counter
    interval = setInterval(function() {
      ctx.fillStyle = 'rgb(' + Math.round(r + dr * i) + ','
        + Math.round(g + dg * i) + ','
        + Math.round(b + db * i) + ')';
      drawFillCell(context, cell);
      i++;
      if(i === steps) { // stop if done
        clearInterval(interval);
      }
    }, 5);
}

// highlight the cell
function highlightCell(context, cell) {
  fadeOutRectangle(context, cell, 10, 10, 10);
}

// highlight cells on hover.
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

// credit to http://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon
function insidePoly(poly, pointx, pointy) {
  var i, j;
  var inside = false;
  for (i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    if(((poly[i].y > pointy) != (poly[j].y > pointy)) && (pointx < (poly[j].x-poly[i].x) * (pointy-poly[i].y) / (poly[j].y-poly[i].y) + poly[i].x) ) inside = !inside;
  }
  return inside;
}

// given a cell, get the vertices associated with the corners of the cell.
function cellToVertices(cell) {
  var vertices = [];
  for (var x in cell.halfedges) {
    vertices.push(cell.halfedges[x].getEndpoint());
  }
  return vertices;
}

// adapter for method from so
function doesIntersect(cell, x, y) {
  return insidePoly(cellToVertices(cell), x, y);
}

// helper to find the cells that intersect and to perform the fade out operation.
function highlightIntersection(context, cells, x, y) {
  for (var cell in cells){
    if (doesIntersect(cells[cell], x, y)) {
      highlightCell(context, cells[cell]);
    }
  }
}

//draw the original tesselation
for (x = 0; x < diagram.cells.length; x++) {
  drawCell(context, diagram.cells[x]);
}

// Handle user mouse movement.
canvas.addEventListener('mousemove', function(evt) {
  var mousePos = getMousePos(canvas, evt);
  highlightIntersection(context, diagram.cells, mousePos.x, mousePos.y)
}, false);
