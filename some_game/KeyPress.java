import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.awt.event.KeyAdapter;
import javax.swing.*;
class KeyPress extends KeyAdapter implements KeyListener{
//	@Override
	public void keyTyped(KeyEvent e) {}
//	@Override
	public void keyPressed(KeyEvent e) {
		int keys=e.getKeyCode();
		System.out.println("key has been pressed!");
	if(keys==39){
			mainCode.move(20);
			System.out.println( "right pressed");
		}
	else if(keys==37){
		System.out.println( "left pressed");
		mainCode.move(-20);
		}
	}

//	@Override
	public void keyReleased(KeyEvent e) {}
}