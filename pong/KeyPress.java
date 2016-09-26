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
		if(keys==KeyEvent.VK_UP){
			mainCode.player2.isActive = true;
			mainCode.player2.acceleration = -1;
			
		}
		else if(keys==KeyEvent.VK_DOWN){
			mainCode.player2.isActive = true;
			mainCode.player2.acceleration = 1;
			
		}
		if(keys==KeyEvent.VK_W){
			mainCode.player1.isActive = true;
			mainCode.player1.acceleration = -1;
		}
		else if(keys==KeyEvent.VK_S){
			mainCode.player1.isActive = true;
			mainCode.player1.acceleration = 1;
		}
	}

//	@Override
	public void keyReleased(KeyEvent e) {
		int keys=e.getKeyCode();
		if(keys==KeyEvent.VK_UP){
			mainCode.player2.acceleration = 0;
			
		}
		else if(keys==KeyEvent.VK_DOWN){
			mainCode.player2.acceleration = 0;
			
		}
		if(keys==KeyEvent.VK_W){
			mainCode.player1.acceleration = 0;
		}
		else if(keys==KeyEvent.VK_S){
			mainCode.player1.acceleration = 0;
		}
	}
}