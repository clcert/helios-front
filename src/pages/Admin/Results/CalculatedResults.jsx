import ResumeElection from "./ResumeElection";
import ResumeWeights from "./ResumeWeights";
import ResultsPerQuestion from "./ResultsPerQuestion";
import Tabs from "../component/Tabs";

import { useState } from "react";

function StyledBox({ children }) {
  return (
    <div className="box " style={{ width: "100%" }}>
      {children}
    </div>
  );
}

function SelectGroup({ group, groups, setGroup }) {
  const handleChange = (e) => {
    setGroup(e.target.value);
  };
  return (
    <>
      <span className="mr-2">Selecciona el grupo:</span>
      <div className="control d-lg-inline-flex">
        <div className="select">
          <select value={group} onChange={handleChange}>
            {groups.map((group) => {
              return (
                <option key={group} value={group}>
                  {group}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </>
  );
}

function TotalResults({ election, questions, totalResults }) {
  return (
    <>
      <StyledBox>
        <ResumeElection />
      </StyledBox>
      {election.max_weight !== 1 && (
        <StyledBox>
          <ResumeWeights />
        </StyledBox>
      )}
      <StyledBox>
        <ResultsPerQuestion
          election={election}
          questions={questions}
          results={totalResults}
        />
      </StyledBox>
    </>
  );
}

function GroupedResults({
  group,
  groups,
  setGroup,
  election,
  questions,
  groupResult,
}) {
  return (
    <>
      <StyledBox>
        <SelectGroup group={group} groups={groups} setGroup={setGroup} />
      </StyledBox>
      <StyledBox>
        <ResumeElection grouped={true} group={group} />
      </StyledBox>
      {election.max_weight !== 1 && (
        <StyledBox>
          <ResumeWeights group={group} grouped={true} />
        </StyledBox>
      )}

      <StyledBox>
        <ResultsPerQuestion
          election={election}
          questions={questions}
          results={groupResult}
        />
      </StyledBox>
    </>
  );
}

export default function CalculatedResults({
  questions,
  totalResults,
  groupResult,
  election,
  group,
  groups,
  setGroup,
}) {
  const [actualTab, setActualTab] = useState(0);

  const tabs = ["Total elección", "Por grupos"];
  return (
    <>
      {election.grouped_voters && (
        <Tabs actualTab={actualTab} setActualTab={setActualTab} tabs={tabs} />
      )}
      {actualTab === 0 && (
        <TotalResults
          election={election}
          totalResults={totalResults}
          questions={questions}
        />
      )}

      {actualTab === 1 && (
        <GroupedResults
          group={group}
          groups={groups}
          setGroup={setGroup}
          election={election}
          questions={questions}
          groupResult={groupResult}
        />
      )}
    </>
  );
}
