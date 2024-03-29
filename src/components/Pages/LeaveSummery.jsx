import React, { Component } from "react";
import Paper from "@mui/material/Paper";
import axios from "axios";
import date from "date-and-time";
import Checkbox from '@mui/material/Checkbox';
import {
  ViewState,
  EditingState,
  IntegratedEditing,GroupingState,IntegratedGrouping
} from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  WeekView,
  Resources,
  Toolbar,
  DateNavigator,
  Appointments,
  DragDropProvider,
  GroupingPanel,
  TodayButton,
  ViewSwitcher,
  MonthView,
  DayView,
  AppointmentForm,
  AppointmentTooltip,
  ConfirmationDialog,
} from "@devexpress/dx-react-scheduler-material-ui";
import styled from "styled-components";
import Navbar from "../Navbar";
import { Button, makeStyles } from "@material-ui/core";
import { green, lightBlue } from "@material-ui/core/colors";
import FormControlLabel from '@mui/material/FormControlLabel';
//import { appointments } from "./appointments";
// ##################################################################

const messages = {
  moreInformationLabel: "",
};

const Label = (props) => {
  // if (props.text === "Details") {
  //   return null;
  // }
  return <AppointmentForm.Label {...props} />;
};

const TextEditor = (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  if (props.type === "multilineTextEditor") {
    return null;
  }
  // if (props.placeholder === "Title") {
  //   return null;
  // }
  return <AppointmentForm.TextEditor {...props} />;
};
const checkValidation = ({ onFieldChange, appointmentData, ...restProps }) => {
  // eslint-disable-next-line react/destructuring-assignment
  // if (props.type === "multilineTextEditor") {
  //   return null;
  // }
  // console.log("first")
  // if (restProps.placeholder === "Title") {
  //   console.log("2")
  //   return false;
  // }
  // return <AppointmentForm.TextEditor {...props} />;
  console.log("first")
  onFieldChange({ title: true });      
};

const BooleanEditor = (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  if (props.label === "All Day" || props.label === "Repeat") {
    return null;
  }
  // if (props.label === "All Day") {
  //   // allDay.label="LEave"
  // }
  // if (props.label === "Repeat") {
  //   return null;
  // }

  return <AppointmentForm.BooleanEditor {...props} />;
};


let newTitle = "";
const optionData = [
  { value: 'Start',text: 'Start',id:1},
  { value: 'Leave',text: 'Leave',id:2},
  { value: 'Stop',text: 'Stop',id:3},
  { value: 'Holiday',text: 'Holiday',id:4},
];
const BasicLayout = ({ onFieldChange, appointmentData, ...restProps }) => {
 
  const onValueChange = (nextValue) => {
    onFieldChange({ status: nextValue });
    if (nextValue==4){
      onFieldChange({ allDay: true });      
    }    
  };

  return (
    <AppointmentForm.BasicLayout
      appointmentData={appointmentData}
      onFieldChange={onFieldChange}
      {...restProps}
    >

      <AppointmentForm.Label text="Options" type="title" />
      <AppointmentForm.Select
        value={appointmentData.status}
         availableOptions={optionData}
        type="outlinedSelect"
        onValueChange={onValueChange}
        placeholder="Customer Phone" 
      />

    </AppointmentForm.BasicLayout>
  );
};

// ###################################################################

export default class LeaveSummery extends Component {

  constructor(props) {
    super(props);

    this.state = {
      data: [],
      currentDate: new Date(),
      //"2018-06-27"
      check: 0,
    }
    this.currentDateChange = (currentDate) => {
      this.setState({ currentDate });
    };

    this.commitChanges = this.commitChanges.bind(this);
    
    this.add = (data) => {
      if (this.state.check == 0) {
        this.state.check = 1;
        axios
          .post(`http://localhost:8000/leave/addLeave`, data)
          .then((response) => {
            if (response.status == 200) {
              console.log(`${response.status}`);
            } else {
              window.alert("Somthing went wrong");
              console.log(`${response.status}`);
              console.log(response.data.message);
            }
          })
          .catch((err) => {
            console.log("Sever error");
            console.log(err);
          });
      }
    };
    this.update = (data) => {
      if (this.state.check == 0) {
        this.state.check = 1;
        console.log("IN")
        console.log(data);
        axios
          .put(`http://localhost:8000/leave/updateLeave`, data)
          .then((response) => {
            if (response.status == 200) {
              console.log(`>>>>>>> ${response.status}`);
            } else {
              window.alert("Somthing went wrong");
              console.log(`${response.status}`);
              console.log(response.data.message);
            }
          })
          .catch((err) => {
            console.log("Sever error");
            console.log(err);
          });
      }
    };
  }

  async componentDidMount() {
    await axios
      .get("http://localhost:8000/leave/getAllLeaves/1")
      .then((res) => {
        if (
          res.data.code == 200 &&
          res.data.success == true &&
          res.data.data.length > 0
        ) {
          console.log(res.data);
          this.setState({ data: res.data.data });
        } else {
          console.log("bad request...");
        }
      })
      .catch((err) => console.log(err));
  }

  commitChanges({ added, changed, deleted }) {
    this.setState((state) => {
      var { data } = state;
      
      if (added) {     
        console.log(added) 
        if(added.status==undefined || added.title==undefined){
           window.alert("Fill the required field");
        }        

        const strTime = date.format(added.startDate, "YYYY-MM-DD HH-mm-ss");
        const endTime = date.format(added.endDate, "YYYY-MM-DD HH-mm-ss");

        if (added.title && added.startDate && added.endDate && added.status) {
          
          const data1 = {
            userId: "1",
            title: added.title,
            startTime: strTime,
            endTime: endTime,
            status:added.status,
            allDay:added.allDay
          };
         this.add(data1);
        
         if(this.state.check==1){
          const startingAddedId =
          data.length > 0 ? data[data.length - 1].id + 1 : 0;
        data = [...data, { id: startingAddedId, ...added }];
        window.location.reload(false);
         }
         else{
          window.alert("error");
         }
        } else {
          window.alert("error");
        }
      }
      if (changed) {
        if(changed[Object.keys(changed)].title==undefined){
          window.alert("Fill the required field");
       }  
        console.log("first")
        console.log(changed[Object.keys(changed)].status);
        console.log("first")
        // data = data.map((appointment) =>
        //   changed[appointment.id]
        //     ? { ...appointment, ...changed[appointment.id] }
        //     : appointment
        // );
        //var changeSize = Object.keys(changed[Object.keys(changed)]).length;
        let strTime,endTime;
        if(changed[Object.keys(changed)].startDate){
           strTime = date.format(
            changed[Object.keys(changed)].startDate,
            "YYYY-MM-DD hh-mm-ss"
          );
          console.log("strTime"+strTime)          
        }
        if(changed[Object.keys(changed)].endDate){
           endTime = date.format(
            changed[Object.keys(changed)].endDate,
            "YYYY-MM-DD hh-mm-ss"
          );
          console.log("endTime"+endTime)  
        }
        
        
        const data2 = {
          id: [Object.keys(changed)],
          title: changed[Object.keys(changed)].title,
          startTime: strTime,
          endTime: endTime,
          status:changed[Object.keys(changed)].status,
            allDay:changed[Object.keys(changed)].allDay
        };

        console.log(">>>>>>")
        console.log(data2)
        this.update(data2);
        if(this.state.check==1){
                data = data.map((appointment) =>
              changed[appointment.id]
                ? { ...appointment, ...changed[appointment.id] }
                : appointment
            );
            window.location.reload(false);
         }
         else{
          window.alert("error");
         }       
      }
      if (deleted !== undefined) {
        console.log(deleted);
        data = data.filter((appointment) => appointment.id !== deleted);
        //console.log(deleted);

        axios
          .delete(`http://localhost:8000/leave/deleteLeave/${deleted}`)
          .then((response) => {
            if (response.status == 200) {
              console.log(response.data.message);
              window.location.reload(false);
            } else {
              window.alert("Somthing went wrong");
              console.log(response.data.message);
            }
          })
          .catch((err) => console.log(err));
      }
      return { data };
    });
  }

  
  render() {
    const { data, currentDate } = this.state;
    
    return (
      <Section>
        <Navbar text={"Calender"} />
        
        <Paper>
          <Scheduler
            data={data}
            height={930}
            onAppointmentFormOpening={this.onAppointmentFormOpening}
          >
            <ViewState
              currentDate={currentDate}
              onCurrentDateChange={this.currentDateChange}
            />
            <EditingState onCommitChanges={this.commitChanges} />
           
            <IntegratedEditing />

            <WeekView startDayHour={0} endDayHour={24} />
            <WeekView
              name="work-week"
              displayName="Work Week"
              excludedDays={[0, 6]}
              startDayHour={9}
              endDayHour={19}
            />
            <MonthView />
           
            <DayView startDayHour={9} endDayHour={19} />
            <Toolbar />
            <DateNavigator />
            <ViewSwitcher />
            <TodayButton />
            <ConfirmationDialog />
            <Appointments />
            <AppointmentTooltip showOpenButton showDeleteButton />
            <AppointmentForm
              basicLayoutComponent={BasicLayout}
              textEditorComponent={TextEditor}
              booleanEditorComponent={BooleanEditor}
              labelComponent={Label}
              messages={messages}
            />
          </Scheduler>
        </Paper>
      </Section>
    );
  }
}

const Section = styled.section`
  margin-left: 18vw;
  padding: 2rem;
  height: 100%;
  .grid {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 1rem;
    margin-top: 2rem;
    .row__one {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      height: 50%;
      gap: 1rem;
    }
    .row__two {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      height: 50%;
    }
  }
  @media screen and (min-width: 280px) and (max-width: 1080px) {
    margin-left: 0;
    .grid {
      .row__one,
      .row__two {
        grid-template-columns: 1fr;
      }
    }
  }
`;
