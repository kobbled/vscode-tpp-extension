/PROG EXAMPLE2
/ATTR
COMMENT = "EXAMPLE2";
TCD:  STACK_SIZE	= 0,
      TASK_PRIORITY	= 50,
      TIME_SLICE	= 0,
      BUSY_LAMP_OFF	= 0,
      ABORT_REQUEST	= 0,
      PAUSE_REQUEST	= 0;
DEFAULT_GROUP = 1,*,*,*,*;
/APPL
/MN
 :  ;
 : CALL NS2_ADD(3.14,2.7182) ;
/POS
P[1:"p1"]{
};
/END
