import java.awt.*;
import java.applet.*;
public class Point extends Applet{
	static int x, y;
	Graphics g; 
	public void makePoint(Graphics i,int originalX,int originalY){
		g=i;
		g.drawLine(originalX,originalY,originalX,originalY);
		x=originalX;
		y=originalY;
	}
	public void redraw(){
		g.drawLine(x,y,x,y);
	}
}