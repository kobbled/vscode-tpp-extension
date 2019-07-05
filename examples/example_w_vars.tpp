#*****************
# PROGRAM NAME
#------------
# program description
#*****************

TP_GROUPMASK = "1,1,*,*,*"
TP_COMMENT = "test program"


foo    := R[1]
i      := R[2]
inc    := R[3]
lowBnd := R[4]
upBnd  := R[5]
indir  := R[6]
speed  := R[7]

namespace nFoo
    bar := R[100]
end

bar  := DO[1]
baz  := DO[2]

sensor  :=  AI[1]

flag := F[1]

home := PR[1]
lpos := PR[2]
pos2 := PR[3]
frame_offset := PR[3]
ofst_tool    := PR[4]

CONST := 100
namespace Math
    PI := 3.14
end

p1    := P[1]

tTime    := TIMER[1]

world    := PR[5]
tool     := PR[6]


#assign frames
indirect('uframe', 1)= world
use_uframe 1
indirect('utool', 1)= tool
use_utool 1


#evaluate
foo = (2%10*5)/2+10
foo = -foo

foo = foo||!(bar||baz)

#namespace
nFoo::bar = 1
foo = Math::PI

#Run LS code
eval "CALL LSPROG"
eval "R[1]=5 ;
      R[2]=3"

#call programs
run prog()

prog()

#loop statement
@loop
  foo += 1

  jump_to @loop if foo < 10

# IO logic
turn_on bar if foo == 5
toggle baz

#timer controls
start tTime
stop tTime
reset tTime
restart tTime

#raise error
raise indirect('ualm',bar)

#wait statements
wait_for(2, 's')
unless baz
    wait_until(bar)
end

# motion
frame_offset = indirect('pr', indir)
frame_offset.z = -foo*2
frame_offset.x = 0
frame_offset.y = 0
frame_offset.group(2).x = 0

#motion with modifiers
joint_move.to(home).at(90, '%').term(-1)

linear_move.to(pos2).at(5, 's').term(0).time_after(0.0, PROG()).
                    offset(frame_offset).
                    tool_offset(ofst_tool)
#LPOS
get_linear_position(lpos)

#skip conditions
set_skip_condition sensor == 0
linear_move.to(p1).at(speed, 'mm/s').term(100).
    offset(frame_offset).
    tool_offset(ofst_tool).
    skip_to(@sensfail,lpos)

@sensfail

# while loop
foo = 0
while i < inc
    #call program
    prog(foo, lowBnd, upBnd)

    # if statement
    @embededLbl
    if lowBnd > 0 && upBnd < 1
        turn_on flag
    else
        turn_on flag
    end

    i += 1
end

#for loop
for i in (1 to inc)
    if i % 2 == 0
        even_prog()
    end
end

#jump statement and indirect
jump_to @end if indirect('f',indir)
jump_to @end unless flag
unless bar
    # foo is false
end

#case statement
case foo
    when 1
        option1()
    when 2
        option2()
    else
        jump_to @end
    end

@end

position_data
{
  'positions' : [
    {
      'id' : 1,
      'mask' :  [{
        'group' : 1,
        'uframe' : 1,
        'utool' : 1,
        'config' : {
            'flip' : true,
            'up'   : true,
            'top'  : true,
            'turn_counts' : [0,0,0]
            },
        'components' : {
            'x' : 0.0,
            'y' : 0.0,
            'z' : 0.0,
            'w' : 0.0,
            'p' : 0.0,
            'r' : 0.0
            }
        },
        {
        'group' : 2,
        'uframe' : 1,
        'utool' : 1,
        'components' : {
            'J1' : 0.0
            }
        }]
    }
  ]
}
end