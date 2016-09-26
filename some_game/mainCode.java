import java.awt.*;
import javax.swing.JFrame;
import javax.swing.JPanel;
import java.awt.event.*;
import java.awt.event.KeyEvent;
import javax.swing.*;
public class mainCode extends JPanel implements KeyListener{
	public static int playerX;
	public static int playerY;
	public static int[] circleX={0,0,0,0,0};
	public static int[] circleY={0,0,0,0,0};
	public static int circleCount=0;
	public static int hasMoved=0;
	public static square player=new square();
	static circle circle1=new circle();
	static circle circle2=new circle();
	static circle circle3=new circle();
	static circle circle4=new circle();
	static circle circle5=new circle();
	static int points=0;
	static String pointsString;
	public void paint(Graphics g){
			//while(true){
			tick(g);
			g.setColor(Color.black);
			player.initialize(g);
			circle1.initialize(g);
			circle2.initialize(g);
			circle3.initialize(g);
			circle4.initialize(g);
			circle5.initialize(g);
			pointsString=""+points;
			g.drawString(pointsString,500,500);
			repaint();
		//}
	}
	public static void main(String[] args) {
		JFrame frame=new JFrame("square and circle game");
		frame.add(new mainCode());
		//frame.add(mainCode.player());
		frame.setSize(1000, 1000);
		frame.setVisible(true);
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		KeyPress keys=new KeyPress();
		frame.addKeyListener(keys);
	}
	public static void tick(Graphics g){
		try{Thread.sleep(10);}
		catch(Exception e){}
		g.setColor(Color.white);
		g.fillRect(0,0,1000,1000);
		g.setColor(Color.black);
	}
	public void keyTyped(KeyEvent e) {}
	public void keyPressed(KeyEvent e) {
		int keys=e.getKeyCode();
	if(keys==KeyEvent.VK_RIGHT){
			player.move(10);
			System.out.println( "right pressed");
		}
	else if(keys==KeyEvent.VK_LEFT){
		System.out.println( "left pressed");
		player.move(-10);
		}
	}
	public void keyReleased(KeyEvent e) {}
	
	public static void move(int i){
	player.move(i);
	}
	public static void addPoints(){
		points++;
	}
}
