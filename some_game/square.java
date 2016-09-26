import java.awt.*;
import java.applet.*;
import java.awt.Graphics;
import java.awt.event.MouseEvent;
import javax.swing.JPanel;
public class square{
	Graphics i;
	int x=0;
	public void paint(Graphics g){
		//g=i;
	}
	public void initialize(Graphics g){
		//i=g;
		System.out.println(x);
		//mainCode.tick(g);
		g.setColor(Color.black);
		g.fillRect(x,0,25,25);
	}
	public void move(int e){
		x=x+e;
		//repaint();
	}
}