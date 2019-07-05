/PROG EXAMPLE_W_VARS
/ATTR
COMMENT = "test program";
TCD:  STACK_SIZE	= 0,
      TASK_PRIORITY	= 50,
      TIME_SLICE	= 0,
      BUSY_LAMP_OFF	= 0,
      ABORT_REQUEST	= 0,
      PAUSE_REQUEST	= 0;
DEFAULT_GROUP = 1,1,*,*,*;
/MN
 : ! ***************** ;
 : ! PROGRAM NAME ;
 : ! ------------ ;
 : ! program description ;
 : ! ***************** ;
 :  ;
 :  ;
 :  ;
 :  ;
 :  ;
 :  ;
 :  ;
 :  ;
 :  ;
 :  ;
 :  ;
 :  ;
 : ! assign frames ;
 : UFRAME[1]=PR[5:world] ;
 : UFRAME_NUM=1 ;
 : UTOOL[1]=PR[6:tool] ;
 : UTOOL_NUM=1 ;
 :  ;
 : ! evaluate ;
 : R[1:foo]=((2 MOD 10*5)/2+10) ;
 : R[1:foo]=R[1:foo]*(-1) ;
 :  ;
 : R[1:foo]=(R[1:foo] OR !(DO[1:bar] OR DO[2:baz])) ;
 :  ;
 : ! namespace ;
 : R[100:nFoo bar]=1 ;
 : R[1:foo]=3.14 ;
 :  ;
 : ! Run LS code ;
 : CALL LSPROG ;
 : R[1]=5 ;
 :       R[2]=3 ;
 :  ;
 : ! call programs ;
 : RUN PROG ;
 :  ;
 : CALL PROG ;
 :  ;
 : ! loop statement ;
 : LBL[100:loop] ;
 : R[1:foo]=R[1:foo]+1 ;
 :  ;
 : IF R[1:foo]<10,JMP LBL[100] ;
 :  ;
 : ! IO logic ;
 : IF (R[1:foo]=5),DO[1:bar]=(ON) ;
 : DO[2:baz]=(!DO[2:baz]) ;
 :  ;
 : ! timer controls ;
 : TIMER[1]=START ;
 : TIMER[1]=STOP ;
 : TIMER[1]=RESET ;
 : TIMER[1]=STOP ;
 : TIMER[1]=RESET ;
 : TIMER[1]=START ;
 :  ;
 : ! raise error ;
 : UALM[DO[1:bar]] ;
 :  ;
 : ! wait statements ;
 : WAIT 2.00(sec) ;
 : IF (DO[2:baz]),JMP LBL[104] ;
 : WAIT (DO[1:bar]) ;
 : LBL[104] ;
 :  ;
 : ! motion ;
 : PR[3:frame_offset]=PR[R[6:indir]] ;
 : PR[3,3:frame_offset]=(R[1:foo]*(-1)*2) ;
 : PR[3,1:frame_offset]=0 ;
 : PR[3,2:frame_offset]=0 ;
 : PR[GP2:3,1:frame_offset]=0 ;
 :  ;
 : ! motion with modifiers ;
 : J PR[1:home] 90% CNT(-1) ;
 :  ;
 : L PR[3:pos2] 5sec CNT0 TA .00sec,CALL PROG Offset,PR[3:frame_offset] Tool_Offset,PR[4:ofst_tool] ;
 : ! LPOS ;
 : PR[2:lpos]=LPOS ;
 :  ;
 : ! skip conditions ;
 : SKIP CONDITION AI[1:sensor]=0 ;
 : L P[1:p1] R[7:speed]mm/sec CNT100 Offset,PR[3:frame_offset] Tool_Offset,PR[4:ofst_tool] Skip,LBL[101],PR[2:lpos]=LPOS ;
 :  ;
 : LBL[101:sensfail] ;
 :  ;
 : ! while loop ;
 : R[1:foo]=0 ;
 : LBL[105] ;
 : IF R[2:i]>=R[3:inc],JMP LBL[106] ;
 : ! call program ;
 : CALL PROG(R[1:foo],R[4:lowBnd],R[5:upBnd]) ;
 :  ;
 : ! if statement ;
 : LBL[102:embededLbl] ;
 : IF (R[4:lowBnd]<=0 OR R[5:upBnd]>=1),JMP LBL[107] ;
 : F[1:flag]=(ON) ;
 : JMP LBL[108] ;
 : LBL[107] ;
 : F[1:flag]=(ON) ;
 : LBL[108] ;
 :  ;
 : R[2:i]=R[2:i]+1 ;
 : JMP LBL[105] ;
 : LBL[106] ;
 :  ;
 : ! for loop ;
 : FOR R[2:i]=1 TO R[3:inc] ;
 : IF (R[2:i] MOD 2=0),CALL EVEN_PROG ;
 : ENDFOR ;
 :  ;
 : ! jump statement and indirect ;
 : IF (F[R[6:indir]]),JMP LBL[103] ;
 : IF (!F[1:flag]),JMP LBL[103] ;
 : IF (DO[1:bar]),JMP LBL[109] ;
 : ! foo is false ;
 : LBL[109] ;
 :  ;
 : ! case statement ;
 : SELECT R[1:foo]=1,CALL OPTION1 ;
 :        =2,CALL OPTION2 ;
 :        ELSE,JMP LBL[103] ;
 :  ;
 : LBL[103:end] ;
 :  ;
/POS
P[1:""]{
   GP1:
  UF : 1, UT : 1,  CONFIG : 'F U T, 0, 0, 0',
  X = 0.0 mm, Y = 0.0 mm, Z = 0.0 mm,
  W = 0.0 deg, P = 0.0 deg, R = 0.0 deg   GP2:
  UF : 1, UT : 1, 
	J[:J1, 0.0] = 0 deg

};
/END
