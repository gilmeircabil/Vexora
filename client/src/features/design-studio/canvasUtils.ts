import {
  Rect,
  Circle,
  Triangle,
  Polygon,
  Path,
  Line,
  Textbox,
  FabricImage,
  Point,
  type Canvas,
  type FabricObject,
} from 'fabric';

/**
 * Creates standard editable shapes
 */
export function addRectangle(canvas: Canvas, options: Partial<any> = {}) {
  const center = canvas.getCenterPoint();
  const rect = new Rect({
    left: center.x - 100,
    top: center.y - 100,
    width: 200,
    height: 200,
    fill: '#FACC15',
    stroke: '#000000',
    strokeWidth: 3,
    rx: options.rx || 0,
    ry: options.ry || 0,
    ...options,
  });
  canvas.add(rect);
  canvas.setActiveObject(rect);
  canvas.requestRenderAll();
  return rect;
}

export function addCircle(canvas: Canvas, options: Partial<any> = {}) {
  const center = canvas.getCenterPoint();
  const circle = new Circle({
    left: center.x - 100,
    top: center.y - 100,
    radius: 100,
    fill: '#38BDF8',
    stroke: '#000000',
    strokeWidth: 3,
    ...options,
  });
  canvas.add(circle);
  canvas.setActiveObject(circle);
  canvas.requestRenderAll();
  return circle;
}

export function addTriangle(canvas: Canvas, options: Partial<any> = {}) {
  const center = canvas.getCenterPoint();
  const triangle = new Triangle({
    left: center.x - 100,
    top: center.y - 100,
    width: 200,
    height: 180,
    fill: '#F43F5E',
    stroke: '#000000',
    strokeWidth: 3,
    ...options,
  });
  canvas.add(triangle);
  canvas.setActiveObject(triangle);
  canvas.requestRenderAll();
  return triangle;
}

export function addStar(canvas: Canvas, options: Partial<any> = {}) {
  const center = canvas.getCenterPoint();
  const points = [];
  const spikes = 5;
  const outerRadius = 100;
  const innerRadius = 45;

  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  for (let i = 0; i < spikes; i++) {
    points.push({ x: Math.cos(rot) * outerRadius, y: Math.sin(rot) * outerRadius });
    rot += step;
    points.push({ x: Math.cos(rot) * innerRadius, y: Math.sin(rot) * innerRadius });
    rot += step;
  }

  const star = new Polygon(points, {
    left: center.x - 100,
    top: center.y - 100,
    fill: '#FBBF24',
    stroke: '#000000',
    strokeWidth: 3,
    strokeLineJoin: 'round',
    ...options,
  });
  canvas.add(star);
  canvas.setActiveObject(star);
  canvas.requestRenderAll();
  return star;
}

export function addHexagon(canvas: Canvas, options: Partial<any> = {}) {
  const center = canvas.getCenterPoint();
  const points = [];
  const sides = 6;
  const radius = 100;

  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides;
    points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
  }

  const hex = new Polygon(points, {
    left: center.x - 100,
    top: center.y - 100,
    fill: '#10B981',
    stroke: '#000000',
    strokeWidth: 3,
    ...options,
  });
  canvas.add(hex);
  canvas.setActiveObject(hex);
  canvas.requestRenderAll();
  return hex;
}

export function addLine(canvas: Canvas, options: Partial<any> = {}) {
  const center = canvas.getCenterPoint();
  const line = new Line([center.x - 150, center.y, center.x + 150, center.y], {
    stroke: '#000000',
    strokeWidth: 4,
    strokeLineCap: 'round',
    ...options,
  });
  canvas.add(line);
  canvas.setActiveObject(line);
  canvas.requestRenderAll();
  return line;
}

export function addHeart(canvas: Canvas, options: Partial<any> = {}) {
  const center = canvas.getCenterPoint();
  const heartPath =
    'M 200,100 A 45,45 0 0,0 155,145 A 45,45 0 0,0 110,100 A 45,45 0 0,0 65,145 C 65,190 155,270 155,270 C 155,270 245,190 245,145 A 45,45 0 0,0 200,100 Z';

  const heart = new Path(heartPath, {
    left: center.x - 100,
    top: center.y - 100,
    fill: '#EC4899',
    stroke: '#000000',
    strokeWidth: 3,
    scaleX: 1,
    scaleY: 1,
    ...options,
  });
  canvas.add(heart);
  canvas.setActiveObject(heart);
  canvas.requestRenderAll();
  return heart;
}

export function addSpeechBubble(canvas: Canvas, options: Partial<any> = {}) {
  const center = canvas.getCenterPoint();
  const bubblePath =
    'M 20 20 L 260 20 A 10 10 0 0 1 270 30 L 270 150 A 10 10 0 0 1 260 160 L 100 160 L 60 200 L 70 160 L 20 160 A 10 10 0 0 1 10 150 L 10 30 A 10 10 0 0 1 20 20 Z';

  const bubble = new Path(bubblePath, {
    left: center.x - 135,
    top: center.y - 100,
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 3,
    ...options,
  });
  canvas.add(bubble);
  canvas.setActiveObject(bubble);
  canvas.requestRenderAll();
  return bubble;
}

/**
 * Text element creator
 */
export function addText(
  canvas: Canvas,
  type: 'heading' | 'subheading' | 'body',
  customText?: string,
  options: Partial<any> = {},
) {
  const center = canvas.getCenterPoint();

  let text = customText || 'Add text';
  let fontSize = 24;
  let fontWeight: string | number = 'normal';
  let fontFamily = 'Inter';

  if (type === 'heading') {
    text = customText || 'Add a Heading';
    fontSize = 54;
    fontWeight = '900';
    fontFamily = 'Montserrat';
  } else if (type === 'subheading') {
    text = customText || 'Add a subheading';
    fontSize = 32;
    fontWeight = 'bold';
    fontFamily = 'Montserrat';
  } else {
    text = customText || 'Add a little bit of body text for details and descriptions.';
    fontSize = 22;
    fontWeight = 'normal';
    fontFamily = 'Inter';
  }

  const textbox = new Textbox(text, {
    left: center.x - 200,
    top: center.y - 50,
    width: 400,
    fontSize,
    fontWeight,
    fontFamily,
    fill: '#000000',
    textAlign: 'center',
    splitByGrapheme: true,
    ...options,
  });

  canvas.add(textbox);
  canvas.setActiveObject(textbox);
  canvas.requestRenderAll();
  return textbox;
}

/**
 * Adds image from URL
 */
export async function addImageFromUrl(canvas: Canvas, url: string, options: Partial<any> = {}) {
  try {
    const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
    const center = canvas.getCenterPoint();

    // Scale to reasonable default size on canvas
    const maxDim = 400;
    const scale = Math.min(maxDim / (img.width || maxDim), maxDim / (img.height || maxDim), 1);

    img.set({
      left: center.x - ((img.width || 0) * scale) / 2,
      top: center.y - ((img.height || 0) * scale) / 2,
      scaleX: scale,
      scaleY: scale,
      ...options,
    });

    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.requestRenderAll();
    return img;
  } catch (err) {
    console.error('Failed to load image onto canvas:', err);
    throw err;
  }
}

/**
 * Alignment snapping guidelines
 */
export function setupSnapping(canvas: Canvas) {
  const SNAP_THRESHOLD = 8;

  canvas.on('object:moving', (e) => {
    const obj = e.target;
    if (!obj) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const bound = obj.getBoundingRect();

    // Horizontal center snap
    const objCenterX = bound.left + bound.width / 2;
    if (Math.abs(objCenterX - canvasWidth / 2) < SNAP_THRESHOLD) {
      obj.set({ left: canvasWidth / 2 - bound.width / 2 });
    }

    // Vertical center snap
    const objCenterY = bound.top + bound.height / 2;
    if (Math.abs(objCenterY - canvasHeight / 2) < SNAP_THRESHOLD) {
      obj.set({ top: canvasHeight / 2 - bound.height / 2 });
    }
  });
}
