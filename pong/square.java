import java.awt.*;
import java.applet.*;
import java.awt.Graphics;
import java.awt.event.MouseEvent;
import javax.swing.JPanel;
public class square{
	Graphics g;
	int x=250;
	int y;
	int xAccel = 0;
	public int points = 0;
	public String pointsString = "0";
	public int acceleration;
	public boolean isActive = false;

	public square(int y){
		this.y=y;
	}
	public void initialize(Graphics g){
		if(isActive){
			move(acceleration);
		}
		else{
			moveCPU();
		}
		g.setColor(Color.white);
		g.fillRect(y,x,25,75);
		pointsString = ""+points;
	}

	public void moveCPU(){
		int e;
		if(((x>mainCode.circle1.y))&&(x>-1)){
			e=-5;
		}
		else if(((x<mainCode.circle1.y-75))&&(x<424)){
			e=5;
		}
		else{
			e=0;
		}

		if((x+xAccel+e>0)&&(x+xAccel+e<424)){
			if(e!=0){
				xAccel+=e;
				x+=xAccel;
			}
			else{
				if(xAccel<-10){
					xAccel+=5;
					x+=xAccel;
				}
				else if(xAccel>10){
					xAccel-=5;
					x+=xAccel;
				}
				else{
					xAccel = 0;
				}
			}
		}
		else{
			xAccel = 0;

		}
	}

	public void move(int e){

		if((x+xAccel+e>0)&&(x+xAccel+e<424)){
			if(e!=0){
				xAccel+=e;
				x+=xAccel;
			}
			else{
				if(xAccel<-10){
					xAccel+=5;
					x+=xAccel;
				}
				else if(xAccel>10){
					xAccel-=5;
					x+=xAccel;
				}
				else{
					xAccel = 0;
				}
			}
		}
		else{
			acceleration = 0;
			xAccel = 0;

		}
	}
}