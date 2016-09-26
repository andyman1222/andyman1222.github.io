import java.awt.*;
import javax.swing.*;


class main extends JPanel{
    public static JFrame frame = new JFrame("thingy");
    static Dimension windowSize = frame.getContentPane().getSize();
    static List<Ball> bouncies = new ArrayList<Ball>();

    public void paint(Graphics g){
        Graphics2D g2d = (Graphics)g;
        while(true){
            for(int i = 0; i < bouncies.size();i++){
                g2d.fillOval(bouncies.get(i).x, bouncies.get(i).y, bouncies.get(i).width, bouncies.get(i).height);
            }
        }
    }

    public static void main(String[] args){
        
		frame.add(new JFrameTest());
		frame.setSize(3000, 3000);
		frame.setVisible(true);
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }
}
class Ball {

}