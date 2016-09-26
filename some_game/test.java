import java.awt.*;
import javax.swing.*;
class test extends JPanel{
	public static void main(String[] args){
		JFrame frame=new JFrame("paint test");
		frame.setSize(1000, 1000);
		frame.add(new test());
		frame.setVisible(true);
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
	}
	public void paint(Graphics g){
		//while(true){
			System.out.println("looped!");
			g.setColor(Color.red);
			g.fillRect(0,0,100,100);
			repaint();
		//}
	}
}