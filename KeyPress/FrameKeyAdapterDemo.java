import java.awt.*;
import java.awt.event.*;
import java.awt.Graphics;
public class FrameKeyAdapterDemo extends Frame{
    public static void main(String[] args){
    	Frame frame=new Frame("test");
    	helper h1=new helper();
	    frame.addKeyListener(h1);
        frame.setSize(300, 300);
        frame.setVisible(true);
    }
}
class helper extends KeyAdapter{
	public void KeyPressed(KeyEvent e){
		System.out.println("HIHIHIHIHI");
	}
	public void KeyReleased(KeyEvent e){}
	public void KeyTyped(KeyEvent e){}
}