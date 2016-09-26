import java.awt.*;
import java.applet.*;
public class applet_test extends Applet{
	static int x=0;
	static int y=0;
	static int yRounded=0;
	public void paint(Graphics g){
		while(true){
			g.setColor(Color.black);
			g.fillOval(x,(int)(Math.round(Math.sin(y*100)*10)+120),10,10);
			x=x+2;
			y++;
			if(x>480){
				x=0;
			}
			try {
    			Thread.sleep(100);
			}
			catch(InterruptedException ex) {
   				Thread.currentThread().interrupt();
			}
			g.setColor(Color.white);
			g.fillRect(0,0,1000,1000);
		}
	}
}