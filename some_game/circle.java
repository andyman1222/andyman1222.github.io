import java.awt.*;
import java.applet.*;
import javax.swing.JPanel;
import java.awt.Graphics;
public class circle extends JPanel{
	Graphics i;
	int x=(int)Math.round((Math.random()*500)+100);
	int y=(int)Math.round((Math.random()*900)+100);
	public void paint(Graphics g){
		g=i;
	}
	public void initialize(Graphics g){
		g.fillOval(x,y,10,10);
		i=g;
		y=y-((int)Math.round((Math.random()*1)+7));
			if((x<mainCode.player.x+25)&&(x-10>mainCode.player.x)&&(y<25)){
				System.out.println("collided!");
				mainCode.addPoints();
				x=(int)Math.round((Math.random()*500)+100);
				y=(int)Math.round((Math.random()*900)+100);
			}
		if(y<1){
			x=(int)Math.round((Math.random()*500)+100);
			y=(int)Math.round((Math.random()*900)+100);
		}
		//Shape2D filledOval=
		
	}
}