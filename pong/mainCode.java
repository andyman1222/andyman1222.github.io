import java.awt.*;
import javax.swing.JFrame;
import javax.swing.JPanel;
import java.awt.event.*;
import java.awt.event.KeyEvent;
import javax.swing.*;
public class mainCode extends JPanel{
	public static square player1=new square(0);
	public static square player2=new square(975);
	static circle circle1=new circle();
	public void paint(Graphics g){
		tick(g);
		g.setColor(Color.white);
		player1.initialize(g);
		player2.initialize(g);
		circle1.initialize(g);
		g.drawString(player1.pointsString + "-" + player2.pointsString,500,500);
		repaint();
	}
	public static void main(String[] args) {
		JFrame frame=new JFrame("Pong");
		frame.add(new mainCode());
		//frame.add(mainCode.player());
		frame.setSize(1050, 600);
		frame.setVisible(true);
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		KeyPress keys=new KeyPress();
		frame.addKeyListener(keys);
		circle1.respawn();

	}
	public static void tick(Graphics g){
		try{Thread.sleep(10);}
		catch(Exception e){}
		g.setColor(Color.black);
		g.fillRect(0,0,1000,500);
		g.setColor(Color.white);
	}
	public static void addPoints(int player, int point){
		if(player==1){
			player1.points+=point;
		}
		else{
			player2.points+=point;
		}
	}
}
