import Cookies from "js-cookie";
import React, { ReactComponentElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteChannelData,
  getChannelData,
  getSubscribeData,
  Token,
} from "../../api/api";
import {
  AmplitudeResetUserId,
  sendEventToAmplitude,
} from "../../components/Amplitude";

import "../MyPage/hideScroll.css";
import { Link } from "react-router-dom";

export type ChannelDataType = {
  id: number;
  team_name: string;
  team_icon: string;
  name: string;
};

const MyPage = () => {
  const [channel, setChannel] = useState<ChannelDataType[]>([]);
  const [activeTab, setActiveTab] = useState(channel.length);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const authToken = Token();

  useEffect(() => {
    if (!authToken) {
      navigate("/landingpage");
    } else {
      sendEventToAmplitude("view my page", "");
    }
  }, [authToken, navigate]);

  const handleChannelAdd = () => {
    sendEventToAmplitude("click add destination", "");
    window.location.href =
      "https://slack.com/oauth/v2/authorize?client_id=6427346365504.6466397212374&scope=incoming-webhook,team:read&user_scope=";
  };

  const handleGetChannel = async () => {
    try {
      const response = await getChannelData("/api/channel");
      setChannel(response.data);
      const responesSubscribe = await getSubscribeData(
        "/api/newsletter/subscribe"
      );
      if (responesSubscribe.data.length === 0) {
        navigate("/subscribe");
      }
    } catch (error) {
      console.log("Api 데이터 불러오기 실패");
    }
  };

  const handleDeleteChannel = async (channelId: number) => {
    try {
      await deleteChannelData(channelId);
      setChannel(channel.filter((data) => data.id !== channelId));
    } catch (error) {
      console.log("Api 데이터 삭제 실패");
    }
  };

  useEffect(() => {
    handleGetChannel();
  }, []);

  const handleLogOut = async () => {
    Cookies.remove("authToken");
    await AmplitudeResetUserId();
    navigate("/sign-in");
  };

  const handleModalOpen = () => {
    setOpenModal(true);
  };

  return (
    <div className="bg-whitesmoke h-screen">
      <div className="text-center mx-auto max-w-[1300px] h-auto bg-white">
        {/* 마이페이지 요소들의 display 요소 설정 */}
        <div className="flex">
          <NavBar></NavBar>
          <List></List>
          <Main></Main>
        </div>
      </div>
    </div>
  );
};

const NavBar = () => {
  return (
    <div
      className="flex flex-col  flex-[7%]  border-r-[1px] border-r-#E8E8E8 
    shadow-[1px_0px_5px_0px_#E8E8E8] h-screen min-w-[100px] justify-between"
    >
      <div className="pt-[10px]  overflow-auto hideScroll">
        <Item index="1" name="미라클"></Item>
        <Item index="2" name="탑스터"></Item>
        <Item index="3" name="브랜드"></Item>
        <Item index="4" name="어쩌구"></Item>
        <Item index="5" name="저쩌구구구"></Item>
        <Item index="6" name="미라클"></Item>
        <Item index="7" name="미라클"></Item>
        <Item index="8" name="미라클"></Item>
        <ChangeButton></ChangeButton>
      </div>
      <div className="">
        <div className="">
          <Option></Option>
        </div>
        <div className="border-t-[1px] border-t-#E8E8E8">
          <Authentication></Authentication>
        </div>
      </div>
    </div>
  );
};

const Authentication = () => {
  return (
    <div className="py-[12px]">
      <span className="font-extrabold underline">로그아웃</span>
    </div>
  );
};

const Item = ({ index, name }: any) => {
  return (
    <div className=" px-[19px] border-b-[1px] border-b-#E8E8E8">
      <div className="mt-[15px] w-auto">
        <img
          className="mx-auto size-[42px]"
          src={"images/" + index + ".png"}
          alt=""
        />
      </div>
      <div className="text-[13px] mt-[6px] mb-[15px] text-[14px] font-bold text-[#666666]">
        {name}
      </div>
    </div>
  );
};

// Item이랑 합치면 되는데 시간 없으니깐 나중에 합치기
const ChangeButton = () => {
  return (
    <div className="mt-[15px] px-[19px] ">
      <div className="bg-[#EEEEEE]  size-[42px] mx-auto rounded-xl">
        <img
          className="mx-auto size-[32px] h-full"
          src="images\plus2.svg"
          alt=""
        />
      </div>
      <div className="text-[13px] my-[15px] h-[13px] text-[16px] font-bold text-[#666666]">
        변경
      </div>
    </div>
  );
};

const Option = () => {
  return (
    <div className="mt-[15px] px-[19px] ">
      <div className="bg-[#EEEEEE]  size-[42px] mx-auto rounded-xl">
        <img
          className="mx-auto size-[15px] h-full"
          src="images\setting.svg"
          alt=""
        />
      </div>
      <div className="text-[13px] my-[15px] h-[13px] text-[16px] font-bold text-[#666666]">
        설정
      </div>
    </div>
  );
};

const List = () => {
  return (
    <div className="max-w-[310px]  flex-[24%] border-r-[1px] border-r-#E8E8E8 flex flex-col shadow-[1px_0px_5px_0px_#E8E8E8] h-screen">
      <div className="min-h-[inherit]">
        <ListItem item={<Header></Header>}></ListItem>
      </div>
      <div className="overflow-auto hideScroll">
        <ListItem item={<Column></Column>}></ListItem>
        <ListItem item={<Column></Column>}></ListItem>
        <ListItem item={<Column></Column>}></ListItem>
        <ListItem item={<Column></Column>}></ListItem>
        <ListItem item={<Column></Column>}></ListItem>
        <ListItem item={<Column></Column>}></ListItem>
        <ListItem item={<Column></Column>}></ListItem>
        <ListItem item={<Column></Column>}></ListItem>
        <ListItem item={<Column></Column>}></ListItem>
        <ListItem item={<Column></Column>}></ListItem>
        <ListItem item={<Column></Column>}></ListItem>
        <ListItem item={<Column></Column>}></ListItem>
        <ListItem item={<Column></Column>}></ListItem>
        <ListItem item={<Column></Column>}></ListItem>
      </div>
    </div>
  );
};

const Header = () => {
  return (
    <div className="flex items-center gap-[15px] min-h-[inherit]">
      <div className="text-[30px] font-bold">Pockets</div>
      <span>11</span>
    </div>
  );
};

const ListItem = ({ item }: any) => {
  return (
    <div className="min-h-[100px] border-b-[1px] border-b-#E8E8E8 ">
      <div className="ml-[20px] focus:bg-slate-100 min-h-[inherit]">{item}</div>
    </div>
  );
};

const Column = () => {
  return (
    <div className="text-[16px] font-bold text-left">
      <div className="py-[12px]">
        <div className=" text-[#666666]">The best font loading strategies</div>
        <div className=" text-[#8F8F8F]">Frontend Focus</div>
        <div className="text-[#D3D0D5] mt-[10px]">2024년 02월 06일 화요일</div>
      </div>
    </div>
  );
};

const Main = () => {
  return (
    <div className="flex-[70%] h-full">
      <div className="max-w-[700px] mx-auto mt-[30px]">
        <div>
          <MainHeader></MainHeader>
        </div>
      </div>
    </div>
  );
};

const MainHeader = () => {
  return (
    <div className="flex flex-col gap-[10px] font-bold border-b-[1px] border-b-#E8E8E8 pb-[30px]">
      <div className="flex justify-between">
        <div className="flex gap-[7px] items-center">
          <div>
            <img className="mx-auto size-[30px]" src={"images/1.png"} alt="" />
          </div>
          <div className="text-[#8F8F8F]">캐릿</div>
        </div>
        <div className="text-[#D3D0D5] text-[14px]">
          2020년 03월 23일 화요일
        </div>
      </div>
      <div className="font-extrabold text-[30px] text-left">
        The Best font loading strategies
      </div>
    </div>
  );
};
export default MyPage;
