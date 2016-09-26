import java.awt.*;
import javax.swing.*;
public class worm extends JPanel{

	static int windowX = 1000;
	static int windowY = 1000;

	public static void main(String[] args){
		JFrame frame = new JFrame("test");
		frame.setSize(1000, 1000);
		frame.add(new worm());
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.setVisible(true);
	}
	public void paint(Graphics g){
		int count, number, count2;
		int[] y=new int[6];
		int[] x=new int[6];
		Color[] colors=new Color[6];
		int xChange, yChange=0;
		long round;
		x[0]=0;
		x[1]=0;
		x[2]=0;
		x[3]=0;
		x[4]=0;
		colors[0]=Color.red;
		colors[1]=Color.red;
		colors[2]=Color.orange;
		colors[3]=Color.yellow;
		colors[4]=Color.green;
		colors[5]=Color.blue;
		y[0]=0;
		y[1]=0;
		y[2]=0;
		y[3]=0;
		y[4]=0;
		xChange=0;
		yChange=0;
		while(true){
			if((Math.round(Math.random()*10)<=5)){
				yChange=0;
				if(Math.round(Math.random()*10)<=5){
					if(x[0]+10>windowX){
						xChange=0;
						x[0]=0;
					}
					else{
						xChange=10;
					}
				}
				else{
					if(x[0]-10<0){
						xChange=0;
						x[0]=1000;
					}
					else{
						xChange=-10;
					}
				}
			}
			else{
				xChange=0;
				if(Math.round(Math.random()*10)<=5){
					if(y[0]+10>windowY){
						yChange=0;
						y[0]=0;
					}
					else{
						yChange=10;
					}
				}
				else{
					if(y[0]-10<0){
						yChange=0;
						y[0]=1000;
					}
					else{
						yChange=-10;
					}
				}
			}
			x[0]=x[0]+xChange;
			y[0]=y[0]+yChange;
			for(count=5;count>0;count--){
				x[count]=x[count-1];
				y[count]=y[count-1];
			}
			for(count=0;count<6;count++){
				g.setColor(colors[count]);
				g.fillOval(Math.abs(x[count]),Math.abs(y[count]),10,10);
				System.out.println(x[count]+" "+y[count]);
			}
			try {
    			Thread.sleep(100);
			}
			catch(InterruptedException ex) {
   				Thread.currentThread().interrupt();
			}
			clear(g);
		}
	}
	void clear(Graphics g){
		g.setColor(Color.white);
		g.fillRect(0,0,10000,10000);
		g.setColor(Color.black);
	}
}